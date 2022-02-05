import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { DocumentApi, DocumentJobPayload } from '../../../shared/api/DocumentApi';
import { Document } from '../../../shared/model/Document';
import { UserService } from '../../../shared/service/user.service';
import {
  IFormField,
  LEVEL_DOCUMENT,
  LEVEL_GATHERING,
  LEVEL_TAXON_CENSUS,
  LEVEL_UNIT,
  VALUE_IGNORE
} from '../model/excel';
import { MappingService } from './mapping.service';
import * as Hash from 'object-hash';
import { catchError, delay, switchMap } from 'rxjs/operators';
import { ArrayType } from '@angular/compiler';

interface IData {
  rowIdx: number;
  hash: string;
  data: Record<string, string>;
}

interface ILevelData {
  [parent: string]: IData;
}

export enum CombineToDocument {
  none = 'none',
  gathering = 'gathering',
  all = 'all'
}

export interface IDocumentData {
  document: Document;
  rows: {[row: number]: boolean};
  skipped: number[];
  ref?: {
    [hash: string]: {
      [parentLevel: string]: number;
    };
  };
}

interface JobStatus {
  total: number;
  processed: number;
  percentage: number;
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
    identifications: LEVEL_UNIT,
    gatheringEvent: LEVEL_DOCUMENT,
    gatheringFact: LEVEL_GATHERING,
    unitFact: LEVEL_UNIT,
    unitGathering: LEVEL_UNIT
  };

  constructor(
    private mappingService: MappingService,
    private documentApi: DocumentApi,
    private userService: UserService,
    private translateService: TranslateService
  ) { }

  hasInvalidValue(value: unknown, field: IFormField) {
    const mappedValue = this.mappingService.map(value, field);
    return Array.isArray(mappedValue) ? mappedValue.indexOf(null) > -1 : mappedValue === null;
  }

  validateData(document: Document|Document[]): Observable<any> {
    return this.documentApi.validate(document, {
      personToken: this.userService.getToken(),
      lang: this.translateService.currentLang,
      validationErrorFormat: 'jsonPath'
    });
  }

  waitToComplete(type: keyof Pick<DocumentApi, 'validate'|'create'>, jobPayload: DocumentJobPayload, processCB: (status: JobStatus) => void): Observable<any> {
    const personToken = this.userService.getToken();
    const source$ = type === 'validate' ?
      this.documentApi.validate(jobPayload, {personToken}) :
      this.documentApi.create(jobPayload, personToken);
    return source$.pipe(
      switchMap(response => {
        processCB(response.status);
        if (response.status.percentage === 100) {
          return of(response);
        }
        return of(response).pipe(
          delay(1000),
          switchMap(() => this.waitToComplete(type, jobPayload, processCB))
        );
      }),
      catchError((e) => {
        console.log('ERROR', e);
        return of(e).pipe(
          delay(1000),
          switchMap(() => this.waitToComplete(type, jobPayload, processCB))
        );
      })
    );
  }

  sendData(
    job: DocumentJobPayload
  ): Observable<any> {
    return this.documentApi.create(job, this.userService.getToken(), {
      lang: this.translateService.currentLang
    });
  }

  flatFieldsToDocuments(
    data: {[col: string]: any}[],
    mapping: {[col: string]: string},
    fields: {[key: string]: IFormField},
    formID: string,
    ignoreRowsWithNoCount = true,
    combineBy: CombineToDocument = CombineToDocument.gathering
  ): {document: Document; skipped: number[]; rows: {[row: number]: boolean}}[] {
    return this.rowsToDocument(data, mapping, fields, formID, ignoreRowsWithNoCount, combineBy);
  }

  hasValue(value): boolean {
    if (Array.isArray(value)) {
      value = value.filter(this.hasValue);
      return value.filter(this.hasValue).length !== 0;
    }
    return value !== VALUE_IGNORE && value !== '' && value !== null && value !== undefined;
  }

  private getParent(field: IFormField, combineBy: CombineToDocument) {
    if (combineBy === CombineToDocument.none) {
      return LEVEL_DOCUMENT;
    }
    const result = this.newToParent[field.parent] ? this.newToParent[field.parent] : field.parent;
    if (combineBy === CombineToDocument.gathering && result === LEVEL_GATHERING) {
      return LEVEL_DOCUMENT;
    }
    return result;
  }

  private getRootHash(parentData: ILevelData) {
    if (parentData[LEVEL_DOCUMENT]) {
      return parentData[LEVEL_DOCUMENT].hash;
    } else if (parentData[LEVEL_GATHERING]) {
      return parentData[LEVEL_GATHERING].hash;
    } else if (parentData[LEVEL_UNIT]) {
      return parentData[LEVEL_UNIT].hash;
    }
    return false;
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

  private findDocumentData(data: ILevelData[]): IData {
    const l = (data || []).length;
    for (let i = 0; i <= l; i++) {
      if (data[i].document) {
        return data[i].document;
      }
    }
    return null;
  }

  private rowsToDocument(
    rows: {[col: string]: any}[],
    mapping: {[col: string]: string},
    fields: {[key: string]: IFormField},
    formID: string,
    ignoreRowsWithNoCount,
    combineBy: CombineToDocument
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
      const parent = this.getParent(field, combineBy);
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
        const parent = this.getParent(field, combineBy);
        if (!parentData[parent]) {
          parentData[parent] = {
            rowIdx,
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
          if (Array.isArray(parentData[parent].data[field.key])) {
            parentData[parent].data[field.key] = parentData[parent].data[field.key].concat(value);
          } else {
            parentData[parent].data[field.key] = value;
          }
        }
      });

      // Count the hash to different levels in the document. This needs to be done only if prentBy !== eachRow
      if (combineBy !== CombineToDocument.none) {
        Object.keys(parentData).forEach(key => {
          // Unit rows don't require hash counting since all of them need to have different hashes
          // (otherwise identical rows would be skipped and this was not desired byt the PO)
          parentData[key].hash = key === LEVEL_UNIT ? '' + rowIdx : Hash(parentData[key].data, {algorithm: 'sha1'});
        });
      }
      const rootHash = this.getRootHash(parentData);
      if (rootHash === false) {
        return;
      }
      if (!documents[rootHash]) {
        documents[rootHash] = [];
      }
      documents[rootHash].push(parentData);
    });

    if (rows.length > ImportService.maxPerDocument) {
      this.reduceUnitCount(documents, ImportService.maxPerDocument);
    }

    // Build the documents
    const docs: {[hash: string]: IDocumentData} = {};
    Object.keys(documents).forEach(hash => {
      if (!docs[hash]) {
        docs[hash] = {document: {formID}, ref: {[hash]: {}}, rows: {}, skipped: []};
        const docData = this.findDocumentData(documents[hash]);
        docs[hash].rows[docData.rowIdx] = true;
        if (ignoreRowsWithNoCount && !this.hasCountValue(docData.data) && combineBy === CombineToDocument.none) {
          docs[hash].skipped.push(docData.rowIdx);
          docs[hash].document = null;
          return;
        }
        this.valuesToDocument(
          this.relativePathToAbsolute(docData.data),
          docs[hash].document
        );
      }
      documents[hash].forEach(row => {
        [LEVEL_GATHERING, LEVEL_TAXON_CENSUS, LEVEL_UNIT].forEach(level => {
          const levelHash = this.findLevelHash(row, level);
          if ((!docs[hash].ref[levelHash] || level === LEVEL_UNIT) && row[level] && row[level].data) {
            if (ignoreRowsWithNoCount && level === LEVEL_UNIT && !this.hasCountValue(row[level].data)) {
              docs[hash].skipped.push(row[level].rowIdx);
              return;
            }
            const parentHash = this.findParentHash(row, level);
            if (!docs[hash].ref[parentHash]) {
              docs[hash].ref[parentHash] = {};
            }
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

  private reduceUnitCount(data: {[hash: string]: ILevelData[]}, max: number): void {
    Object.keys(data).forEach(hash => {
      if (data[hash].length <= max) {
        return;
      }
      const j = data[hash].length;
      for (let i = 0; i < j; i += max) {
        data[hash + i] = data[hash].splice(0, max);
      }
      delete data[hash];
    });
  }

  private valuesToDocument(values: {[key: string]: any}, document: any) {
    Object.keys(values).map(path => {
      const re = /[.(\[\])]/;
      const parts = path.split(re).filter(value => value !== '');
      let pointer = document;
      let now: string|number = parts.shift();
      while (parts.length > 0) {
        if (typeof pointer[now] === 'undefined') {
          pointer[now] = this.isNumber(parts[0]) ? [] : {};
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
    const replaces: {from: string; to: string}[] = [];
    const result = {};
    if (spot) {
      Object.keys(spot).map(level => {
        if (level === LEVEL_DOCUMENT || level === '') {
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
