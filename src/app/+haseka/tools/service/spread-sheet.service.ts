import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { environment } from '../../../../environments/environment';
import {Document, Person} from '../../../shared/model';
import {TriplestoreLabelService, UserService} from '../../../shared/service';

import { DOCUMENT_LEVEL, FormField, IGNORE_VALUE } from '../model/form-field';
import {MappingService, SpeciesTypes} from './mapping.service';

@Injectable()
export class SpreadSheetService {

  private odsMimeType = 'application/vnd.oasis.opendocument.spreadsheet';
  private xlsxMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  private translations = {};
  private newToParent = {
    'identifications': 'units'
  };

  constructor(
    private mappingService: MappingService,
    private labelService: TriplestoreLabelService,
    private translateService: TranslateService,
    private userService: UserService
  ) {
    this.translateService.onLangChange
      .map(() => this.translateService.currentLang)
      .startWith(this.translateService.currentLang)
      .distinctUntilChanged()
      .switchMap((lang) => Observable.combineLatest(
        this.labelService.get('MY.document', lang),
        this.labelService.get('MZ.gatheringEvent', lang),
        this.labelService.get('MY.taxonCensusClass', lang),
        this.labelService.get('MY.gathering', lang),
        this.labelService.get('MY.gatheringFactClass', lang),
        this.labelService.get('MY.identification', lang),
        this.labelService.get('MY.unit', lang),
        this.labelService.get('MY.unitFactClass', lang),
        (
          document,
          gatheringEvent,
          taxonCensus,
          gatherings,
          gatheringFact,
          identifications,
          units,
          unitFact
        ) => ({
          document,
          gatheringEvent,
          taxonCensus,
          gatherings,
          gatheringFact,
          identifications,
          units,
          unitFact
        })))
      .subscribe(translations => this.translations = translations)

  }

  isValidType(type) {
    return [this.odsMimeType, this.xlsxMimeType].indexOf(type) > -1;
  }

  generate(filename: string, fields: FormField[], useLabels = true, type: 'ods' | 'xlsx' = 'xlsx') {
    this.userService.getUser()
      .subscribe((person) => {
        const sheet = XLSX.utils.aoa_to_sheet(this.fieldsToAOA(fields, useLabels, {person: person}));
        const book = XLSX.utils.book_new();

        this.addMetaDataToSheet(fields, sheet, useLabels);
        XLSX.utils.book_append_sheet(book, sheet);

        this.downloadData(XLSX.write(book, {bookType: type, type: 'buffer'}), filename, type);
      });

  }

  formToFlatFieldsLookUp(form: any, addIgnore = false): {[key: string]: FormField} {
    const result = {};
    this.formToFlatFields(form, addIgnore)
      .map(field => {
        result[field.key] = field;
      });
    return result;
  }

  formToFlatFields(form: any, addIgnore = false): FormField[] {
    const result: FormField[] = [];
    if (addIgnore) {
      result.push({
        parent: '',
        required: false,
        type: 'string',
        key: IGNORE_VALUE,
        label: 'ignore',
        fullLabel: 'ignore'
      });
    }
    if (form && form.schema && form.schema.properties) {
      this.parserFields(form.schema, {properties: form.validators}, result, '', DOCUMENT_LEVEL);
    }
    return result;
  }

  flatFieldsToDocuments(
    data: {[col: string]: any}[],
    mapping: {[col: string]: string},
    fields: {[key: string]: FormField},
    formID: string
  ): {document: Document, rows: {[row: number]: {[level: string]: number}}}[] {
    const cols = Object.keys(mapping);
    const parents = cols.reduce((previous, current) => {
      const field = fields[mapping[current]];
      if (previous.indexOf(field.parent) === -1) {
        previous.push(field.parent);
      }
      return previous;
    }, []);
    const spot = parents.reduce((previous, current) => ({...previous, [current]: 0}), {});
    this.resetPreviousValue(fields);

    return this.rowsToDocument(data, mapping, fields, spot, formID);
  }

  loadSheet(data: any) {
    const workBook: XLSX.WorkBook = XLSX.read(data, {type: 'array', cellDates: true});
    const sheetName: string = workBook.SheetNames[0];
    const sheet: XLSX.WorkSheet = workBook.Sheets[sheetName];

    this.setDateFormat(sheet);
    return [
      <any>XLSX.utils.sheet_to_json<{[key: string]: string}>(sheet, {header: 'A'}),
      sheet
    ]
  }

  setDateFormat(sheet: XLSX.WorkSheet) {
    for (const i in sheet) {
      if (!sheet.hasOwnProperty(i) || !sheet[i].t || sheet[i].t !== 'd') {
        continue;
      }
      sheet[i].z = sheet[i].w.length <= 10 ? 'YYYY-MM-DD' : 'YYYY-MM-DD hh:mm:ss';
      delete sheet[i].w;
    }
  }

  getColMapFromComments(sheet: XLSX.WorkSheet, fields: {[key: string]: FormField}) {
    const map = {};
    let idx = 0, col;
    let address = XLSX.utils.encode_cell({r: 0, c: idx});

    this.mappingService.initColMap(fields);
    while (col = sheet[address]) {
      let found = false;
      if (Array.isArray(col.c)) {
        for (let i = 0; i < col.c.length; i++) {
          if (col.c.t) {
            const commentKey = this.mappingService.colMap(col.c.t);
            if (commentKey !== null) {
              map[XLSX.utils.encode_col(idx)] = commentKey;
              found = true;
              break;
            }
          }
        }
        if (found) {
          break;
        }
      }
      if (col.v) {
        const valueKey = this.mappingService.colMap(col.v);
        if (valueKey !== null) {
          map[XLSX.utils.encode_col(idx)] = valueKey;
        }
      }
      address = XLSX.utils.encode_cell({r: 0, c: ++idx});
    }
    return map;
  }

  findFormIdFromFilename(filename: string): string {
    for (const id of environment.massForms) {
      const regEx = new RegExp('\\b' + id + '\\b');
      if (regEx.test(filename)) {
        return id;
      }
    }
    return '';
  }

  private rowsToDocument(
    rows: {[col: string]: any}[],
    mapping: {[col: string]: string},
    fields: {[key: string]: FormField},
    spot: {[level: string]: number},
    formID: string
  ): {document: Document, rows: {[row: number]: {[level: string]: number}}}[] {
    const cols = Object.keys(mapping);
    const result: {document: Document, rows: {[row: number]: {[level: string]: number}}}[] = [];
    const allLevels = [];
    let document: any = {};
    let rowSpots: {[row: number]: {[level: string]: number}} = {};
    cols.map(col => {
      const field = fields[mapping[col]];
      const parent = this.getParent(field);
      if (field.key === IGNORE_VALUE) {
        return;
      }
      if (allLevels.indexOf(parent) === -1) {
        allLevels.push(parent);
      }
    });
    rows.map((row, rowIdx) => {
      const newLevels = [];
      const values = {'formID': formID};
      cols.map((col) => {
        if (!row[col]) {
          return;
        }
        const field = fields[mapping[col]];
        const value = this.mappingService.map(row[col], field);
        const parent = this.getParent(field);
        if (field.key === IGNORE_VALUE || value === IGNORE_VALUE) {
          return;
        }
        values[field.key] = value;
        if (field.previousValue !== null && field.previousValue !== row[col] && newLevels.indexOf(parent) === -1) {
          newLevels.push(this.getParent(field));
        }
        field.previousValue = row[col];
      });
      if (newLevels.indexOf(DOCUMENT_LEVEL)  !== -1) {
        this.resetPreviousValue(fields);
        Object.keys(spot).map(level => spot[level] = 0);
        result.push({document: document, rows: rowSpots});
        document = {};
        rowSpots = {};
      } else {
        const toZero = [];
        newLevels.map(level => {
          cols.map(col => {
            const field = fields[mapping[col]];
            allLevels.map(subLevel => {
              if (subLevel === level || toZero.indexOf(subLevel) > -1) {
                return;
              }
              const subLevelRegExp = new RegExp(`\\b${level}\\[\\*\\].*\\b${subLevel}\\[\\*\\]`, 'g');
              if (subLevelRegExp.test(field.key)) {
                toZero.push(subLevel);
              }
            });
          });
          spot[level]++;
        });
        toZero.map(subLevel => {
          spot[subLevel] = 0;
          this.resetPreviousValue(fields, subLevel);
        });
      }
      rowSpots[rowIdx] = {...spot};
      this.valuesToDocument(this.relativePathToAbsolute(values, spot), document);
    });
    result.push({document: document, rows: rowSpots});

    return result;
  }

  private getParent(field: FormField) {
    return this.newToParent[field.parent] ? this.newToParent[field.parent] : field.parent;
  }

  private relativePathToAbsolute(values: {[key: string]: any}, spot: {[level: string]: number}): {[key: string]: any} {
    const replaces: {from: string, to: string}[] = [];
    const result = {};
    Object.keys(spot).map(level => {
      if (level === DOCUMENT_LEVEL || level === '') {
        return;
      }
      replaces.push({from: `\\b${level}\\[\\*\\]`, to: `${level}[${spot[level]}]`})
    });
    Object.keys(values).map(key => {
      let targetKey = key;
      replaces.map(replace => {
        const regExp = new RegExp(replace.from, 'g');
        targetKey = targetKey.replace(regExp, replace.to);
      });
      if (targetKey.endsWith('[*]')) {
        targetKey = targetKey.slice(0, -3);
      }
      targetKey = targetKey.replace(/\[\*]/g, '[0]');
      result[targetKey] = values[key];
    });
    return result;
  }

  private valuesToDocument(values: {[key: string]: any}, document: any) {
    Object.keys(values).map(path => {
      const re = /[.(\[\])]/;
      const parts = path.split(re).filter(value => value !== '');
      let pointer = document;
      let now: string|number = parts.shift();
      while (parts.length > 0) {
        if (!pointer[now]) {
          pointer[now] = this.isNumber(parts[1] || '') ? {} : [];
        }
        pointer = pointer[now];
        now = parts.shift();
      }
      pointer[now] = values[path];
    });
  }

  private isNumber(value: any) {
    return !isNaN(Number(value));
  }

  private resetPreviousValue(fields: {[key: string]: FormField}, level?: string) {
    Object.keys(fields).map(key => {
      if ((level && fields[key].parent === level) || !level) {
        fields[key].previousValue = null;
      }
    });
  }

  private parserFields(form: any, validators: any, result: FormField[], root, parent, lastKey = '', lastLabel = '', required = []) {
    if (!form || !form.type || (form.options && form.options.excludeFromSpreadSheet)) {
      return;
    }
    const label = form.title || lastLabel;
    switch (form.type) {
      case 'object':
        if (form.properties) {
          let found = false;
          Object.keys(form.properties).map(key => {
            found = true;
            this.parserFields(
              form.properties[key],
              validators.properties && validators.properties && validators.properties[key] || {},
              result,
              root ? root + '.' + key : key,
              form.properties[key].type === 'object' && Object.keys(form.properties[key].properties).length > 0 ? key : parent,
              key,
              label,
              form.required || []
            )
          });
          if (!found) {
            result.push({
              type: form.type,
              label: label,
              fullLabel: label + ' - ' + (this.translations[parent] || parent),
              key: root,
              parent: parent,
              required: this.hasRequiredValidator(lastKey, validators, required),
              enum: form.enum,
              enumNames: form.enumNames,
              default: form.default
            });
          }
        }
        break;
      case 'array':
        if (form.items) {
          const newParent = ['object', 'array'].indexOf(form.items.type) > -1 ? lastKey : parent;
          this.parserFields(form.items, validators.items || validators, result, root + '[*]', newParent, lastKey, label);
        }
        break;
      default:
        result.push({
          type: form.type,
          label: label,
          fullLabel: label + ' - ' + (this.translations[parent] || parent),
          key: root,
          parent: parent,
          required: this.hasRequiredValidator(lastKey, validators, required),
          enum: form.enum,
          enumNames: form.enumNames,
          default: form.default
        });
    }
  }

  private hasRequiredValidator(lastKey, validator, required) {
    return !!validator.presence || (validator.geometry && validator.geometry.requireShape) || required.indexOf(lastKey) > -1;
  }

  private addMetaDataToSheet(fields: FormField[], sheet: XLSX.WorkSheet, useLabels: boolean) {
    const validation = [];
    fields.map((field, idx) => {
      const headerAddress = XLSX.utils.encode_cell({r: 0, c: idx});
      const dataRange = XLSX.utils.encode_range({r: 1, c: idx}, {r: 1000, c: idx});
      const headerCell = sheet[headerAddress];

      if (!headerCell.c) {
        headerCell.c = [];
      }
      headerCell.c.push({a: 'laji.fi', t: field.key});

      if (field.enum) {
        validation.push({
          sqref: dataRange,
          values: (useLabels ? field.enumNames : field.enum).filter(value => value !== '')
        })
      } else if (field.type === 'boolean') {
        validation.push({
          sqref: dataRange,
          values: [
            this.mappingService.mapFromBoolean(true),
            this.mappingService.mapFromBoolean(false)
          ]
        })
      }
    });
    if (validation.length > 0) {
      sheet['!dataValidation'] = validation;
    }
  }

  private fieldsToAOA(fields: FormField[], useLabels: boolean, specials: {person: Person}) {
    const result = [[], []];
    fields.map((field, idx) => {
      const special = this.mappingService.getSpecial(field);
      let value = field.default;

      switch (special) {
        case SpeciesTypes.person:
          value = specials.person && specials.person.id || '';
          break;
      }

      if (useLabels && field.enum && field.default) {
        const valueIdx = field.enum.indexOf(field.default);
        value = field.enumNames[valueIdx];
      } else if (field.type === 'boolean') {
        value = this.mappingService.reverseMap(value, field)
      }
      result[0][idx] = field.fullLabel;
      result[1][idx] = value;
    });
    return result;
  }

  private downloadData(buffer: any, fileName: string, fileExtension: string) {
    const type = fileExtension === 'ods' ? this.odsMimeType : this.xlsxMimeType;

    const data: Blob = new Blob([buffer], {
      type: type
    });

    FileSaver.saveAs(data, fileName + '.' + fileExtension);
  }

}
