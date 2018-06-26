import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import * as XLSX from 'xlsx';
import { environment } from '../../../../environments/environment';
import {TriplestoreLabelService} from '../../../shared/service/triplestore-label.service';

import { DOCUMENT_LEVEL, FormField, VALUE_IGNORE } from '../model/form-field';
import {MappingService} from './mapping.service';

@Injectable()
export class SpreadSheetService {

  public static readonly nameSeparator = ' - ';

  private odsMimeType = 'application/vnd.oasis.opendocument.spreadsheet';
  private xlsxMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  private csvMimeTypes = ['text/csv', 'text/plain', 'application/vnd.ms-excel'];

  private translations = {};

  private requiredFields = {};

  private hiddenFields: string[] = [
    'gatherings[*].units[*].unitFact.autocompleteSelectedTaxonID',
    'gatherings[*].images[*]',
    'gatherings[*].units[*].images[*]',
    'gatherings[*].dateBegin',
    'gatherings[*].dateEnd',
    'gatherings[*].units[*].unitGathering.dateBegin',
    'gatherings[*].units[*].unitGathering.dateEnd',
    'gatherings[*].units[*].unitGathering.geometry',
    'gatherings[*].units[*].checklistID',
    'gatherings[*].units[*].hostID',
  ];

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
        this.labelService.get('MZ.unitGathering', lang),
        (
          document,
          gatheringEvent,
          taxonCensus,
          gatherings,
          gatheringFact,
          identifications,
          units,
          unitFact,
          unitGathering
        ) => ({
          document,
          gatheringEvent,
          taxonCensus,
          gatherings,
          gatheringFact,
          identifications,
          units,
          unitFact,
          unitGathering
        })))
      .subscribe(translations => this.translations = translations)

  }

  isValidType(type) {
    console.log(type);
    return [this.odsMimeType, this.xlsxMimeType, ...this.csvMimeTypes].indexOf(type) > -1;
  }

  setRequiredFields(fields: object) {
    this.requiredFields = fields;
  }

  setHiddenFeilds(fields: string[]) {
    this.hiddenFields = fields;
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
        key: VALUE_IGNORE,
        label: 'ignore',
        fullLabel: 'ignore'
      });
    }
    if (form && form.schema && form.schema.properties) {
      this.parserFields(form.schema, {properties: form.validators}, result, '', DOCUMENT_LEVEL, this.findUnitSubGroups(form.uiSchema));
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

  getColMapFromSheet(sheet: XLSX.WorkSheet, fields: {[key: string]: FormField}, len: number) {
    const map = {};
    let idx = -1, col;

    this.mappingService.initColMap(fields);
    while (idx <= len) {
      const address = XLSX.utils.encode_cell({r: 0, c: ++idx});
      col = sheet[address];
      if (!col) {
        continue;
      }
      let found = false;
      if (Array.isArray(col.c)) {
        for (let i = 0; i < col.c.length; i++) {
          if (col.c.t) {
            const commentKey = this.mappingService.colMap(this.normalizeHeader(col.c.t));
            if (commentKey !== null) {
              map[XLSX.utils.encode_col(idx)] = commentKey;
              found = true;
              break;
            }
          }
        }
        if (found) {
          continue;
        }
      }
      if (col.v) {
        const valueKey = this.mappingService.colMap(this.normalizeHeader(col.v));
        if (valueKey !== null) {
          map[XLSX.utils.encode_col(idx)] = valueKey;
        }
      }
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

  private normalizeHeader(value: string) {
    return (value || '')
      .replace('\u2012', '-')
      .replace('\u2013', '-')
      .replace('\u2014', '-')
      .replace('\u2015', '-')
      .trim();
  }

  private parserFields(
    form: any,
    validators: any,
    result: FormField[],
    root,
    parent,
    unitSubGroups = {},
    lastKey = '',
    lastLabel = '',
    required = []
  ) {
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
            this.parserFields(form.properties[key], validators.properties && validators.properties && validators.properties[key] || {}, result, root ? root + '.' + key : key, form.properties[key].type === 'object' && Object.keys(form.properties[key].properties).length > 0 ? key : parent, unitSubGroups, key, label, form.required || [])
          });
          if (!found) {
            if (this.hiddenFields.indexOf(root) > -1) {
              return;
            }
            result.push({
              type: form.type,
              label: label,
              fullLabel: label + SpreadSheetService.nameSeparator + (this.translations[parent] || parent),
              key: root,
              parent: parent,
              isArray: root.endsWith('[*]'),
              required: this.hasRequiredValidator(lastKey, validators, required, root),
              subGroup: this.analyzeSubGroup(root, parent, unitSubGroups),
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
          this.parserFields(form.items, validators.items || validators, result, root + '[*]', newParent, unitSubGroups, lastKey, label, required);
        }
        break;
      default:
        if (this.hiddenFields.indexOf(root) > -1) {
          return;
        }
        result.push({
          type: form.type,
          label: label,
          fullLabel: label + SpreadSheetService.nameSeparator + (this.translations[parent] || parent),
          key: root,
          parent: parent,
          isArray: root.endsWith('[*]'),
          required: this.hasRequiredValidator(lastKey, validators, required, root),
          subGroup: this.analyzeSubGroup(root, parent, unitSubGroups),
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

  analyzeSubGroup(path, parent, unitSubGroups): string {
    const field = path.split('.').pop();
    if (parent === 'units') {
      if (unitSubGroups[field]) {
        return unitSubGroups[field];
      }
    }
    return undefined;
  }

  private findUnitSubGroups(form) {
    const subGroups = {};
    if (form &&
      form.gatherings &&
      form.gatherings.items &&
      form.gatherings.items.units &&
      form.gatherings.items.units.items &&
      form.gatherings.items.units.items['ui:options'] &&
      form.gatherings.items.units.items['ui:options'].fieldScopes &&
      form.gatherings.items.units.items['ui:options'].fieldScopes.informalTaxonGroups
    ) {
      const groups = form.gatherings.items.units.items['ui:options'].fieldScopes.informalTaxonGroups;
      Object.keys(groups).forEach(key => {
        if (key === '*') {
          return;
        }
        if (Array.isArray(groups[key].additionalFields)) {
          groups[key].additionalFields.forEach(field => {
            subGroups[field] = key;
          })
        }
      });
    }
    return subGroups;
  }
}
