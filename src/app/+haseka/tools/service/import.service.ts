import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { DocumentApi } from '../../../shared/api/DocumentApi';
import { Document } from '../../../shared/model';
import { UserService } from '../../../shared/service/user.service';
import {DOCUMENT_LEVEL, GATHERING_LEVEL, FormField, VALUE_IGNORE} from '../model/form-field';
import { MappingService } from './mapping.service';
import {Util} from '../../../shared/service';

@Injectable()
export class ImportService {

  static readonly maxPerDocument = 500;

  private readonly countFields = [
    'gatherings[*].units[*].count',
    'gatherings[*].units[*].abundanceString',
    'gatherings[*].units[*].individualCount',
    'gatherings[*].units[*].pairCount',
    'gatherings[*].units[*].maleIndividualCount',
    'gatherings[*].units[*].femaleIndividualCount'
  ];

  private readonly newToParent = {
    'identifications': 'units',
    'gatheringEvent': 'document',
    'gatheringFact': 'gatherings',
    'unitFact': 'units',
    'unitGathering': 'units'
  };

  private readonly fieldToNewParent = {
    // 'gatherings[*].dateBegin': 'document', Changing gatheringEvent date already makes new gathering
    // 'gatherings[*].dateEnd': 'document',
    'gatherings[*].geometry': 'document',
    'gatherings[*].namedPlaceID': 'document'
  };

  constructor(
    private mappingService: MappingService,
    private documentApi: DocumentApi,
    private userService: UserService,
    private translateService: TranslateService
  ) { }

  hasInvalidValue(value: any, field: FormField) {
    const mappedValue = this.mappingService.map(value, field);
    return Array.isArray(mappedValue) ? mappedValue.indexOf(null) > -1 : mappedValue === null;
  }

  validateData(document: Document): Observable<any> {
    return this.documentApi.validate(document, {
      personToken: this.userService.getToken(),
      lang: this.translateService.currentLang,
      validationErrorFormat: 'jsonPath'
    })
  }

  sendData(document: Document, publicityRestrictions: Document.PublicityRestrictionsEnum): Observable<any> {
    document.publicityRestrictions = publicityRestrictions;
    return this.documentApi.create(document, this.userService.getToken(), {
      lang: this.translateService.currentLang,
      validationErrorFormat: 'jsonPath'
    })
  }

  flatFieldsToDocuments(
    data: {[col: string]: any}[],
    mapping: {[col: string]: string},
    fields: {[key: string]: FormField},
    formID: string
  ): {document: Document, skipped: number[], rows: {[row: number]: {[level: string]: number}}}[] {
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

  private resetPreviousValue(fields: {[key: string]: FormField}, level?: string) {
    Object.keys(fields).map(key => {
      if ((level && fields[key].parent === level) || !level) {
        fields[key].previousValue = null;
      }
    });
  }

  private getParent(field: FormField) {
    if (this.fieldToNewParent[field.key]) {
      return this.fieldToNewParent[field.key];
    }
    return this.newToParent[field.parent] ? this.newToParent[field.parent] : field.parent;
  }

  private rowsToDocument(
    rows: {[col: string]: any}[],
    mapping: {[col: string]: string},
    fields: {[key: string]: FormField},
    spot: {[level: string]: number},
    formID: string
  ): {document: Document, skipped: number[], rows: {[row: number]: {[level: string]: number}}}[] {
    const cols = Object.keys(mapping);
    const result: {document: Document, skipped: number[], rows: {[row: number]: {[level: string]: number}}}[] = [];
    const allLevels = [];
    let unitCnt = 0;
    let unitsInGathering = this.cntUnitsInGathering(rows, cols, fields, mapping);
    let skipped = [];
    let document: any = {};
    let rowSpots: {[row: number]: {[level: string]: number}} = {};
    cols.map(col => {
      const field = fields[mapping[col]];
      const parent = this.getParent(field);
      if (field.key === VALUE_IGNORE) {
        return;
      }
      if (allLevels.indexOf(parent) === -1) {
        allLevels.push(parent);
      }
    });
    rows.forEach((row, rowIdx) => {
      const newLevels = [];
      const values = {'formID': formID};
      cols.forEach((col) => {
        if (!row[col]) {
          return;
        }
        const field = fields[mapping[col]];
        const parent = this.getParent(field);
        let value = this.mappingService.map(this.mappingService.rawValueToArray(row[col], field), field, true);
        if (!this.hasValue(value)) {
          return;
        }
        if (Array.isArray(value)) {
          value = value.filter(val => val !== VALUE_IGNORE && val !== '');
        }
        if (typeof value === 'object' && value[MappingService.mergeKey]) {
          Object.keys(value[MappingService.mergeKey]).forEach(location => {
            values[location] = value[MappingService.mergeKey][location];
          });
        } else {
          values[field.key] = value;
        }
        if (this.hasNewLevel(field, row[col], newLevels, parent)) {
          newLevels.push(this.getParent(field));
        }
        field.previousValue = row[col];
      });
      if (!this.hasCountValue(values)) {
        skipped.push(rowIdx);
        return;
      }
      unitCnt++;
      unitsInGathering--;
      if (newLevels.indexOf(DOCUMENT_LEVEL) !== -1 || (unitCnt + Math.max(unitsInGathering, 0)) > ImportService.maxPerDocument) {
        Object.keys(spot).map(level => spot[level] = 0);
        result.push({document: document, rows: rowSpots, skipped: skipped});
        unitCnt = 1;
        document = {};
        rowSpots = {};
        skipped = [];
        unitsInGathering = rows[rowIdx + 1] ? this.cntUnitsInGathering(rows.slice(rowIdx + 1), cols, fields, mapping) - 1 : 1;
      } else {
        if (unitsInGathering < 0) {
          unitsInGathering = this.cntUnitsInGathering(rows.slice(rowIdx), cols, fields, mapping);
        }
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
    result.push({document: document, rows: rowSpots, skipped: skipped});

    return result;
  }

  private cntUnitsInGathering(rows, cols, rawFields, mapping) {
    const fields = Util.clone(rawFields);
    let unitCnt = 0;

    for (const row of rows) {
      const newLevels = [];
      cols.map((col) => {
        if (!row[col]) {
          return;
        }
        const field = fields[mapping[col]];
        const parent = this.getParent(field);
        const value = this.mappingService.map(this.mappingService.rawValueToArray(row[col], field), field, true);
        if (!this.hasValue(value)) {
          return;
        }
        if (this.hasNewLevel(field, row[col], newLevels, parent)) {
          newLevels.push(this.getParent(field));
        }
        field.previousValue = row[col];
      });
      if (newLevels.indexOf(DOCUMENT_LEVEL) !== -1 || newLevels.indexOf(GATHERING_LEVEL) !== -1) {
        return Math.min(unitCnt, ImportService.maxPerDocument);
      }
      unitCnt++;
    }
    return Math.min(unitCnt, ImportService.maxPerDocument);
  }

  private hasNewLevel(field, value, newLevels, parent): boolean {
    return field.previousValue !== null && field.previousValue !== value && newLevels.indexOf(parent) === -1;
  }

  private hasValue(value): boolean {
    if (Array.isArray(value)) {
      value = value.filter(this.hasValue);
      return value.filter(this.hasValue).length !== 0;
    }
    return value !== VALUE_IGNORE && value !== '';
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


  private hasCountValue(values: any) {
    for (const field of this.countFields) {
      if (typeof values[field] !== 'undefined') {
        return true;
      }
    }
    return false;
  }
}
