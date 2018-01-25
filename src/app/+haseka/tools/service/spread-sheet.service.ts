import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import * as XLSX from 'xlsx';
import { environment } from '../../../../environments/environment';
import {TriplestoreLabelService} from '../../../shared/service';

import { DOCUMENT_LEVEL, FormField, IGNORE_VALUE } from '../model/form-field';
import {MappingService} from './mapping.service';

@Injectable()
export class SpreadSheetService {

  private odsMimeType = 'application/vnd.oasis.opendocument.spreadsheet';
  private xlsxMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  private translations = {};
  private newToParent = {
    'identifications': 'units'
  };

  private requiredFields = {};

  constructor(
    private mappingService: MappingService,
    private labelService: TriplestoreLabelService,
    private translateService: TranslateService
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

  setRequiredFields(fields: object) {
    this.requiredFields = fields;
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
        isArray: false,
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
              isArray: root.endsWith('[*]'),
              required: this.hasRequiredValidator(lastKey, validators, required, root),
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
          isArray: root.endsWith('[*]'),
          required: this.hasRequiredValidator(lastKey, validators, required, root),
          enum: form.enum,
          enumNames: form.enumNames,
          default: form.default
        });
    }
  }

  private hasRequiredValidator(lastKey, validator, required, key) {
    if (typeof this.requiredFields[key] !== 'undefined') {
      return this.requiredFields[key];
    }
    return !!validator.presence || (validator.geometry && validator.geometry.requireShape) || required.indexOf(lastKey) > -1;
  }
}
