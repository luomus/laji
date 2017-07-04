import { Injectable } from '@angular/core';
import { Document } from '../../../shared/model/Document';
import { Util } from '../../../shared/service/util.service';
import { TriplestoreLabelService } from '../../../shared/service/triplestore-label.service';
import { UserService } from '../../../shared/service/user.service';
import { CollectionService } from '../../../shared/service/collection.service';
import { MetadataService } from '../../../shared/service/metadata.service';
import { TranslateService } from '@ngx-translate/core';
import { DocumentInfoService } from '../../document-info.service';
import { geoJSONToISO6709 } from 'laji-map/lib/utils';
import json2csv from 'json2csv/lib/json2csv';
import { Observable } from 'rxjs/Observable';

/**
 * Csv service
 */
@Injectable()
export class DocumentToCsvService {
  private readonly classNames = [
    {id: 'document', name: 'MY.document'},
    {id: 'gatherings', name: 'MY.gathering'},
    {id: 'gatheringEvent', name: 'MZ.gatheringEvent'},
    {id: 'units', name: 'MY.unit'},
    {id: 'identifications', name: 'MY.identification'}
  ];
  private readonly valuePrefixes = {collection: 'HR', person: 'MA'};

  constructor(
    private translate: TranslateService,
    private labelService: TriplestoreLabelService,
    private userService: UserService,
    private collectionService: CollectionService,
    private metadataService: MetadataService
  ) {}

  public downloadDocumentAsCsv(doc: Document, form: any) {
.   this.getCsv(doc, form).subscribe((csv) => {
      const uri = encodeURI(csv);

      const downloadLink = document.createElement('a');
      downloadLink.href = uri;

      this.translate.get('haseka.submissions.submission').subscribe((msg) => {
        downloadLink.download = msg + '_' + doc.id.split('.')[1] + '.csv';

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      });
    });
  }

  private getCsv(doc: Document, form: any) {
    const fields = this.getFields(doc, form);

    return Observable.forkJoin(
      this.getMetadataData().map((metadataData) => (this.getFieldsData(fields, metadataData))),
      this.getData(Util.clone(doc), form, fields),
      (fieldsData, data) => {
        const csv = 'data:text/csv;charset=utf-8,';
        return csv + json2csv({fields: fieldsData, data: data});
      }
    );
  }

  private getData(obj: any, form: any, fields: any, path = ''): Observable<any> {
    let unwindKey;
    const labelObservables = [];

    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) { continue; }

      if (fields.indexOf(path + key) !== -1) {
        labelObservables.push(this.getLabelToValue(key, obj[key])
          .do((label) => {
            obj[key] = label;
          }));
      }

      const child = obj[key];
      if (Array.isArray(child) && typeof child[0] === 'object') {
        unwindKey = key;
      }
    }

    const labelObservable = labelObservables.length > 0 ? Observable.forkJoin(labelObservables) : Observable.of([]);

    return labelObservable.switchMap(
      () => {
        if (unwindKey) {
          const getDataObservables = [];
          for (let i = 0; i < obj[unwindKey].length; i++) {
            if (!this.isEmpty(unwindKey, obj[unwindKey][i], form)) {
              getDataObservables.push(this.getData(obj[unwindKey][i], form, fields, path + unwindKey + '.'));
            }
          }

          if (getDataObservables.length > 0) {
            return Observable.forkJoin(getDataObservables)
              .map((arrays) => {
                obj[unwindKey] = [].concat.apply([], arrays);
                return this.unwind(unwindKey, obj);
              });
          } else {
            return Observable.of(this.unwind(unwindKey, obj));
          }
        } else {
          return Observable.of([obj]);
        }
      });
  }

  private unwind(key: string, obj: any) {
    const result = [];

    for (let i = 0; i < obj[key].length; i++) {
      result.push(Util.clone(obj));
      result[i][key] = obj[key][i];
    }

    return result;
  }

  private getFieldsData(fields: string[], metadataData: any): any[] {
    const getMetadataIdx = (key: string, className: string): number => {
      for (let i = 0; i < metadataData[className].length; i++) {
        if (metadataData[className][i].shortName === key) { return i; }
      }

      return -1;
    };

    const fieldsData = fields.map((field) => {
      const splitted = field.split('.');
      const className = splitted.length < 2 ? 'document' : splitted[splitted.length - 2];
      const key = splitted[splitted.length - 1];
      const idx = getMetadataIdx(key, className);
      const label = idx > -1 ? metadataData[className][idx].label : '';

      return {label: label, value: field, idx: idx};
    });

    return fieldsData;
  }

  private getFields(doc: Document, form: any) {
    const queue = [{obj: doc, key: 'document', path: ''}];
    let next, obj, key, path;
    const fields = [];

    while (queue.length > 0) {
      next = queue.shift();
      obj = next.obj;
      key = next.key;
      path = next.path;

      for (const i in obj) {
        if (!obj.hasOwnProperty(i) || obj[i] == null || i.charAt(0) === '@'
          || (i === 'id' && key !== 'document') || (Array.isArray(obj[i]) && obj[i].length < 1)) {
          continue;
        }

        let type;

        if (i === 'geometry' || typeof obj[i] !== 'object' || (Array.isArray(obj[i]) && typeof obj[i][0] !== 'object')) {
          type = 'column';
          if (fields.indexOf(path + i) === -1) {
            fields.push(path + i);
          }
        } else if (Array.isArray(obj[i])) {
          type = 'objectArray';
          for (let j = 0; j < obj[i].length; j++) {
            if (!this.isEmpty(i, obj[i][j], form)) {
              queue.push({obj: obj[i][j], key: i, path: path + i + '.'});
            }
          }
        } else {
          type = 'object';
          queue.push({obj: obj[i], key: i, path: path + i + '.'});
        }
      }
    }

    return fields;
  }

  private getMetadataData(): Observable<any> {
    const metadatas$ = [];
    const metadataByKey = {};

    for (let i = 0; i < this.classNames.length; i++) {
      const className = this.classNames[i];
      metadatas$.push(
        this.metadataService.getClassProperties(className.name, this.translate.currentLang)
          .do((metaData) => (metadataByKey[className.id] = metaData))
      );
    }
    return Observable.forkJoin(metadatas$).switchMap(() => (Observable.of(metadataByKey)));
  }

  private getLabelToValue(key: string, obj: any): Observable<any> {
    let value = '';

    if (obj != null) {
      if (key === 'geometry') {
        value += geoJSONToISO6709({
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: obj.geometries ? obj.geometries[0] : obj,
          }]});
      } else if (Array.isArray(obj)) {
        return Observable.from(obj.map((labelKey) => {
          return this.getLabel(labelKey);
        }))
          .mergeAll()
          .toArray()
          .map((array) => {
            return array.join(', ');
          });
      } else {
        return this.getLabel(obj);
      }
    }

    return Observable.of(value);
  }

  private getLabel(key: string): Observable<string> {
    if (typeof key !== 'string') {
      return Observable.of(key);
    }

    if (key.match(new RegExp('^' + this.valuePrefixes.person + '\.[0-9]+$'))) {
      return this.userService
        .getUser(key)
        .map((user) => {
          return user.fullName || key;
        });
    }
    if (key.match(new RegExp('^' + this.valuePrefixes.collection + '\.[0-9]+$'))) {
      return this.collectionService
        .getName(key, this.translate.currentLang)
        .map((name) => {
          return name.length > 0 && name[0].value ? name[0].value : key;
        });
    }

    return this.labelService
      .get(key)
      .map((label) => {
        return label || key;
      });
  }

  private isEmpty(key: string, obj: any, form: any) {
    if (key === 'gatherings') {
      if (!obj.units || obj.units.length < 1) { return true; }

      for (let i = 0; i < obj.units.length; i++) {
        if (!DocumentInfoService.isEmptyUnit(obj.units[i], form)) { return false; }
      }

      return true;
    } else if (key === 'units') {
      return DocumentInfoService.isEmptyUnit(obj, form);
    }

    return false;
  }
}
