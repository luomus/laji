import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin as ObservableForkJoin } from 'rxjs';
import * as XLSX from 'xlsx';
import { environment } from '../../../../environments/environment';
import { TriplestoreLabelService } from '../../../shared/service/triplestore-label.service';

import { IFormField, LEVEL_DOCUMENT, VALUE_IGNORE } from '../model/excel';
import { MappingService } from './mapping.service';
import { distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { GeneratorService } from './generator.service';

interface IColCombine {
  col: string;
  field: string;
  type: string;
  groupId: number;
  order: number;
}

@Injectable()
export class SpreadsheetService {

  public static readonly nameSeparator = ' - ';

  private static groupId = 1;

  private odsMimeType = 'application/vnd.oasis.opendocument.spreadsheet';
  private xlsxMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  private csvMimeTypes = ['text/csv', 'text/tsv', 'text/plain', 'application/vnd.ms-excel'];

  private translations = {};

  private requiredFields = {};

  private hiddenFields: {[formID: string]: string[]} = {
    '*': [
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
    ]
  };

  constructor(
    private mappingService: MappingService,
    private labelService: TriplestoreLabelService,
    private translateService: TranslateService
  ) {
    this.translateService.onLangChange.pipe(
      map(() => this.translateService.currentLang),
      startWith(this.translateService.currentLang),
      distinctUntilChanged(),
      switchMap(lang =>
        ObservableForkJoin([
          this.labelService.get('MY.document', lang),
          this.labelService.get('MZ.gatheringEvent', lang),
          this.labelService.get('MY.taxonCensusClass', lang),
          this.labelService.get('MY.gathering', lang),
          this.labelService.get('MY.gatheringFactClass', lang),
          this.labelService.get('MY.identification', lang),
          this.labelService.get('MY.unit', lang),
          this.labelService.get('MY.unitFactClass', lang),
          this.labelService.get('MZ.unitGathering', lang)
        ])
      ),
      map(([document, gatheringEvent, taxonCensus, gatherings, gatheringFact, identifications, units, unitFact, unitGathering]) =>
         ({ document, gatheringEvent, taxonCensus, gatherings, gatheringFact, identifications, units, unitFact, unitGathering })
      )
    )
      .subscribe(translations => this.translations = translations);

  }

  validTypes(): string[] {
    return [this.odsMimeType, this.xlsxMimeType, ...this.csvMimeTypes];
  }

  setRequiredFields(formID: string, fields: object) {
    this.requiredFields[formID] = fields;
  }

  setHiddenFields(formID: string, fields: string[]) {
    this.hiddenFields[formID] = fields;
  }

  formToFlatFieldsLookUp(form: any, addIgnore = false): {[key: string]: IFormField} {
    const result = {};
    this.formToFlatFields(form, addIgnore)
      .map(field => {
        result[field.key] = field;
      });
    return result;
  }

  formToFlatFields(form: any, addIgnore = false): IFormField[] {
    const result: IFormField[] = [];
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
      this.parserFields(form.schema, {properties: form.validators}, result, '', LEVEL_DOCUMENT, this.findUnitSubGroups(form.uiSchema));
    }
    return result;
  }

  loadSheet(data: any) {
    const workBook: XLSX.WorkBook = XLSX.read(data, {type: 'array', cellDates: true});
    const sheetName: string = workBook.SheetNames[0];
    const sheet: XLSX.WorkSheet = workBook.Sheets[sheetName];

    this.setDateFormat(sheet, !!workBook.Workbook);
    return this.combineSplittedFields(<any>XLSX.utils.sheet_to_json<{[key: string]: string}>(sheet, {header: 'A'}));
  }

  setDateFormat(sheet: XLSX.WorkSheet, hasWorkbook) {
    for (const i in sheet) {
      if (!sheet.hasOwnProperty(i) || !sheet[i].t || sheet[i].t !== 'd' || !(sheet[i].v instanceof Date)) {
        continue;
      }
      if (hasWorkbook) {
        sheet[i].z = sheet[i].w.length <= 10 ? 'YYYY-MM-DD' : 'YYYY-MM-DD"T"hh:mm';
      } else {
        const len = sheet[i].v.getUTCHours() === 0 && sheet[i].v.getUTCMinutes() === 0 && sheet[i].v.getUTCSeconds() === 0 ? 10 : 16;
        sheet[i].v = sheet[i].v.toISOString().substr(0, len);
        sheet[i].t = 's';
      }
      delete sheet[i].w;
    }
  }

  getColMapFromSheet(sheet: {[key: string]: string}, fields: {[key: string]: IFormField}) {
    const colMap = {};

    this.mappingService.initColMap(fields);
    Object.keys(sheet).forEach(key => {
      const valueKey = this.mappingService.colMap(this.normalizeHeader(sheet[key]));
      if (valueKey !== null) {
        colMap[key] = valueKey;
      }
    });
    return colMap;
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

  private combineSplittedFields(data: {[col: string]: string}[]) {
    if (!data || data.length < 2) {
      return data;
    }
    const first = data[0];
    const combines: IColCombine[] = [];
    const matches = [];
    Object.keys(GeneratorService.splitDate).forEach(key => matches.push(GeneratorService.splitDate[key]));
    Object.keys(GeneratorService.splitCoordinate).forEach(key => matches.push(GeneratorService.splitCoordinate[key]));
    const splitRegExp = new RegExp(`(${matches.join('|')})\\b`);

    const getGroup = (field: string): IColCombine => {
      for (const col of combines) {
        if (col.field === field) {
          return col;
        }
      }
      return null;
    };

    Object.keys(first).forEach((key) => {
      const match = first[key].match(splitRegExp);
      const newField = first[key].replace(splitRegExp, '');
      const group = getGroup(newField);
      if (match) {
        combines.push({
          col: key,
          field: newField,
          type: match[1],
          groupId: group && group.groupId || SpreadsheetService.groupId++,
          order: matches.indexOf(match[1])
        });
      }
    });

    if (combines.length === 0) {
      return data;
    }
    const groupedCombines = this.getCombinedGroups(combines);
    return data.map((row, index) => {
      const newRow = {...row};
      for (const group of groupedCombines) {
        const values = {};
        const combineTo = group[0].col;
        for (const col of group) {
          values[col.type] = newRow[col.col];
          delete newRow[col.col];
        }
        if (index === 0) {
          newRow[combineTo] = group[0].field;
        } else {
          newRow[combineTo] = this.getCombinedValue(values);
        }
      }
      return newRow;
    });
  }

  private getCombinedValue(values: {[key: string]: string}): string {
    if (
      typeof values[GeneratorService.splitCoordinate.N] !== 'undefined' ||
      typeof values[GeneratorService.splitCoordinate.E] !== 'undefined' ||
      typeof values[GeneratorService.splitCoordinate.system] !== 'undefined'
    ) {
      return this.getCombinedCoordinateValue(values);
    }
    return this.getCombinedDateValue(values);
  }

  private getCombinedDateValue(values: {[key: string]: string}): string {
    if (!values[GeneratorService.splitDate.dd] && !values[GeneratorService.splitDate.mm] && !values[GeneratorService.splitDate.yyyy]) {
      return '';
    }
    return values[GeneratorService.splitDate.yyyy] + '-' +
      this.addLeadingZero(values[GeneratorService.splitDate.mm]) + '-' +
      this.addLeadingZero(values[GeneratorService.splitDate.dd]);
  }

  private addLeadingZero(val: string | number) {
    val = '' + val;
    if (val.length === 1) {
      return '0' + val;
    }
    return val;
  }

  private getCombinedCoordinateValue(values: {[key: string]: string}): string {
    if (!values[GeneratorService.splitCoordinate.system]) {
      return values[GeneratorService.splitCoordinate.N] + ' ' + values[GeneratorService.splitCoordinate.E];
    }
    const suffix = typeof values[GeneratorService.splitCoordinate.N] === 'undefined' ||
    values[GeneratorService.splitCoordinate.E] === 'undefined' ? ' ' + values[GeneratorService.splitCoordinate.system] : '';

    if (values[GeneratorService.splitCoordinate.system] === GeneratorService.splitCoordinateSystem.ykj) {
      return values[GeneratorService.splitCoordinate.N] + ':' + values[GeneratorService.splitCoordinate.E] + suffix;
    }
    return ('' + values[GeneratorService.splitCoordinate.N]).replace(',', '.') + ',' +
      ('' + values[GeneratorService.splitCoordinate.E]).replace(',', '.') + suffix;
  }

  private getCombinedGroups(combines: IColCombine[]): IColCombine[][] {
    const groups: {[key: string]: IColCombine[]} = {};
    combines.forEach(col => {
      if (!groups[col.groupId]) {
        groups[col.groupId] = [];
      }
      groups[col.groupId].push(col);
    });
    return Object.keys(groups).map(group => {
      groups[group].sort((a, b) => a.order - b.order);
      return groups[group];
    });
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
    result: IFormField[],
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
            this.parserFields(
              form.properties[key],
              validators.properties && validators.properties && validators.properties[key] || {},
              result, root ? root + '.' + key : key,
              form.properties[key].type === 'object' && Object.keys(form.properties[key].properties).length > 0 ? key : parent,
              unitSubGroups,
              key,
              label,
              form.required || []
            );
          });
          if (!found) {
            if (this.isHiddenField(form.id, root)) {
              return;
            }
            result.push({
              type: form.type,
              label: label,
              fullLabel: label + SpreadsheetService.nameSeparator + (this.translations[parent] || parent),
              key: root,
              parent: parent,
              isArray: root.endsWith('[*]'),
              required: this.hasRequiredValidator(form.id, lastKey, validators, required, root),
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
          this.parserFields(
            form.items,
            validators.items || validators,
            result,
            root + '[*]',
            newParent,
            unitSubGroups,
            lastKey,
            label,
            required
          );
        }
        break;
      default:
        if (this.isHiddenField(form.id, root)) {
          return;
        }
        result.push({
          type: form.type,
          label: label,
          fullLabel: label + SpreadsheetService.nameSeparator + (this.translations[parent] || parent),
          key: root,
          parent: parent,
          isArray: root.endsWith('[*]'),
          required: this.hasRequiredValidator(form.id, lastKey, validators, required, root),
          subGroup: this.analyzeSubGroup(root, parent, unitSubGroups),
          enum: form.enum,
          enumNames: form.enumNames,
          default: form.default
        });
    }
  }

  private hasRequiredValidator(formID: string, lastKey, validator, required, key) {
    if (this.requiredFields[formID] && typeof this.requiredFields[formID][key] !== 'undefined') {
      return this.requiredFields[formID][key];
    }
    if (this.requiredFields['*'] && typeof this.requiredFields['*'][key] !== 'undefined') {
      return this.requiredFields['*'][key];
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

  private isHiddenField(formID: string, field: string): boolean {
    return (this.hiddenFields['*']    && this.hiddenFields['*'].indexOf(field) > -1) ||
           (this.hiddenFields[formID] && this.hiddenFields[formID].indexOf(field) > -1);
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
          });
        }
      });
    }
    return subGroups;
  }
}
