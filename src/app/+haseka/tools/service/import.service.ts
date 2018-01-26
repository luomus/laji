import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { DocumentApi } from '../../../shared/api/DocumentApi';
import { Document } from '../../../shared/model';
import { UserService } from '../../../shared/service/user.service';
import {DOCUMENT_LEVEL, FormField, IGNORE_VALUE} from '../model/form-field';
import { MappingService } from './mapping.service';

@Injectable()
export class ImportService {

  private documentReady = false;
  private newToParent = {
    'identifications': 'units',
    'gatheringEvent': 'document',
    'gatheringFact': 'gatherings',
    'unitFact': 'units',
    'unitGathering': 'units'
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
    return this.documentApi.create(document, this.userService.getToken())
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

  private resetPreviousValue(fields: {[key: string]: FormField}, level?: string) {
    Object.keys(fields).map(key => {
      if ((level && fields[key].parent === level) || !level) {
        fields[key].previousValue = null;
      }
    });
  }

  private getParent(field: FormField) {
    return this.newToParent[field.parent] ? this.newToParent[field.parent] : field.parent;
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
        const parent = this.getParent(field);
        let value = this.mappingService.map(this.mappingService.rawValueToArray(row[col], field), field, true);
        if (Array.isArray(value)) {
          value = value.filter(val => val !== IGNORE_VALUE && val !== '');
          if (value.length === 0) {
            return;
          }
        }
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


}
