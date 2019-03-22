import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { DocumentApi } from '../../../shared/api/DocumentApi';
import { Document } from '../../../shared/model/Document';
import { UserService } from '../../../shared/service/user.service';
import { DOCUMENT_LEVEL, IFormField, GATHERING_LEVEL, VALUE_IGNORE } from '../model/excel';
import { MappingService } from './mapping.service';
import { Util } from '../../../shared/service/util.service';
import * as Hash from 'object-hash';

const LEVEL_DOCUMENT = 'document';
const LEVEL_GATHERING = 'gatherings';
const LEVEL_UNIT = 'units';
const LEVEL_TAXON_CENSUS = 'taxonCensus';

interface ILevelData {
  [parent: string]: {
    rowIdx: number;
    hash: string;
    data: object;
  };
}

export interface IDocumentData {
  document: Document;
  rows: {[row: number]: boolean};
  skipped: number[];
  ref?: {
    [hash: string]: {
      [parentLevel: string]: number
    }
  };
}

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
    'identifications': LEVEL_UNIT,
    'gatheringEvent': LEVEL_DOCUMENT,
    'gatheringFact': LEVEL_GATHERING,
    'unitFact': LEVEL_UNIT,
    'unitGathering': LEVEL_UNIT
  };

  private readonly fieldToNewParent = {
    'gatherings[*].geometry': LEVEL_DOCUMENT,
    'gatherings[*].namedPlaceID': LEVEL_DOCUMENT
  };

  constructor(
    private mappingService: MappingService,
    private documentApi: DocumentApi,
    private userService: UserService,
    private translateService: TranslateService
  ) { }

  hasInvalidValue(value: any, field: IFormField) {
    const mappedValue = this.mappingService.map(value, field);
    return Array.isArray(mappedValue) ? mappedValue.indexOf(null) > -1 : mappedValue === null;
  }

  validateData(document: Document): Observable<any> {
    return this.documentApi.validate(document, {
      personToken: this.userService.getToken(),
      lang: this.translateService.currentLang,
      validationErrorFormat: 'jsonPath'
    });
  }

  sendData(document: Document, publicityRestrictions: Document.PublicityRestrictionsEnum): Observable<any> {
    document.publicityRestrictions = publicityRestrictions;
    return this.documentApi.create(document, this.userService.getToken(), {
      lang: this.translateService.currentLang,
      validationErrorFormat: 'jsonPath'
    });
  }

  flatFieldsToDocuments(
    data: {[col: string]: any}[],
    mapping: {[col: string]: string},
    fields: {[key: string]: IFormField},
    formID: string
  ): {document: Document, skipped: number[], rows: {[row: number]: boolean}}[] {
    return this.rowsToDocument(data, mapping, fields, formID);
  }

  hasValue(value): boolean {
    if (Array.isArray(value)) {
      value = value.filter(this.hasValue);
      return value.filter(this.hasValue).length !== 0;
    }
    return value !== VALUE_IGNORE && value !== '' && value !== null && value !== undefined;
  }

  private getParent(field: IFormField, parentBy: 'eachRow'|'newLocation'|'allInSame' = 'newLocation') {
    if (parentBy === 'eachRow') {
      return LEVEL_DOCUMENT;
    }
    if (parentBy === 'newLocation' && this.fieldToNewParent[field.key]) {
      return this.fieldToNewParent[field.key];
    }
    return this.newToParent[field.parent] ? this.newToParent[field.parent] : field.parent;
  }

  private getRootHash(parentData: ILevelData) {
    if (parentData[LEVEL_DOCUMENT]) {
      return parentData[LEVEL_DOCUMENT].hash;
    } else if (parentData[LEVEL_GATHERING]) {
      return parentData[LEVEL_GATHERING].hash;
    }
    return parentData[LEVEL_UNIT].hash;
  }

  private findParentHash(row: ILevelData, level: string) {
    switch (level) {
      case LEVEL_UNIT:
      case LEVEL_TAXON_CENSUS:
        return this.findLevelHash(row, LEVEL_GATHERING);
    }
    return this.findLevelHash(row, LEVEL_DOCUMENT);
  }

  private findLevelHash(row: ILevelData, level) {
    return row[level] ? row[level].hash : '';
  }

  private rowsToDocument(
    rows: {[col: string]: any}[],
    mapping: {[col: string]: string},
    fields: {[key: string]: IFormField},
    formID: string
  ): IDocumentData[] {
    const cols = Object.keys(mapping);
    const allLevels = [];

    // Fetch all columns that are not marked and IGNORE
    const allCols = [];
    cols.map(col => {
      const field = fields[mapping[col]];
      if (field.key === VALUE_IGNORE) {
        return;
      }
      allCols.push(col);
      const parent = this.getParent(field);
      if (allLevels.indexOf(parent) === -1) {
        allLevels.push(parent);
      }
    });

    const documents: {[hash: string]: ILevelData[]} = {};
    rows.forEach((row, rowIdx) => {
      const parentData: ILevelData = {};
      allCols.forEach(col => {
        const field = fields[mapping[col]];
        let value = this.mappingService.map(this.mappingService.rawValueToArray(row[col], field), field, true);
        if (!this.hasValue(value)) {
          return;
        }
        const parent = this.getParent(field);
        if (!parentData[parent]) {
          parentData[parent] = {
            rowIdx: rowIdx,
            hash: '' + rowIdx,
            data: {}
          };
        }

        // Check if array value has values that should be ignored
        if (Array.isArray(value)) {
          value = value.filter(val => val !== VALUE_IGNORE && val !== '');
        }

        // Check if there is are values that should be merged instead
        if (typeof value === 'object' && value[MappingService.mergeKey]) {
          Object.keys(value[MappingService.mergeKey]).forEach(location => {
            parentData[parent].data[location] = value[MappingService.mergeKey][location];
          });
        } else {
          parentData[parent].data[field.key] = value;
        }
      });

      // Count the hash to different levels in the document. This needs to be done only if prentBy !== eachRow
      Object.keys(parentData).forEach(key => {
        parentData[key].hash = Hash(parentData[key].data, {algorithm: 'sha1'});
      });
      const rootHash = this.getRootHash(parentData);
      if (!documents[rootHash]) {
        documents[rootHash] = [];
      }
      documents[rootHash].push(parentData);
    });

    // TODO: Check to see if any of the documents have more than the limit and split accordingly

    // Build the documents
    const docs: {[hash: string]: IDocumentData} = {};
    Object.keys(documents).forEach(hash => {
      if (!docs[hash]) {
        docs[hash] = {document: {'formID': formID}, ref: {[hash]: {}}, rows: {}, skipped: []};
        this.valuesToDocument(
          this.relativePathToAbsolute(documents[hash][0].document.data),
          docs[hash].document
        );
      }
      documents[hash].forEach(row => {
        [LEVEL_GATHERING, LEVEL_TAXON_CENSUS, LEVEL_UNIT].forEach(level => {
          const levelHash = this.findLevelHash(row, level);
          if ((!docs[hash].ref[levelHash] || level === LEVEL_UNIT) && row[level] && row[level].data) {
            if (level === LEVEL_UNIT && this.hasCountValue(row[level].data)) {
              docs[hash].skipped.push(row[level].rowIdx);
              return;
            }
            const parentHash = this.findParentHash(row, level);
            const parentRef = docs[hash].ref[parentHash];
            parentRef[level] = typeof parentRef[level] === 'undefined' ? 0 : parentRef[level] + 1;
            docs[hash].ref[levelHash] = {...parentRef};
            docs[hash].rows[row[level].rowIdx] = true;
            this.valuesToDocument(this.relativePathToAbsolute(row[level].data, parentRef), docs[hash].document);
          }
        });
      });
    });

    return Object.keys(docs).map((hash) => ({document: docs[hash].document, rows: docs[hash].rows, skipped: docs[hash].skipped}));
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

  private relativePathToAbsolute(values: {[key: string]: any}, spot?: {[level: string]: number}): {[key: string]: any} {
    const replaces: {from: string, to: string}[] = [];
    const result = {};
    if (spot) {
      Object.keys(spot).map(level => {
        if (level === DOCUMENT_LEVEL || level === '') {
          return;
        }
        replaces.push({from: `\\b${level}\\[\\*\\]`, to: `${level}[${spot[level]}]`});
      });
    }
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
