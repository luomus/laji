import { Injectable } from '@angular/core';
import { Document } from '../../../shared/model/Document';
import { Util } from '../../../shared/service/util.service';
import { TriplestoreLabelService } from '../../../shared/service/triplestore-label.service';
import { UserService } from '../../../shared/service/user.service';
import { CollectionService } from '../../../shared/service/collection.service';
import { TranslateService } from '@ngx-translate/core';
import { DocumentInfoService } from '../../document-info.service';
import { geoJSONToISO6709 } from 'laji-map/lib/utils';
import json2csv from 'json2csv/lib/json2csv';
import { Observable } from 'rxjs/Observable';

/**
 * Csv service
 */
@Injectable()
export class CsvService {
  constructor(
    private translate: TranslateService,
    private labelService: TriplestoreLabelService,
    private userService: UserService,
    private collectionService: CollectionService
  ) {}

  public downloadDocumentAsCsv(doc: Document, form: any) {
    this.documentToCsvData(doc, form).subscribe(data => {
      let csv = 'data:text/csv;charset=utf-8,';
      csv += json2csv({ data: data });

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

  private documentToCsvData(document: Document, form: any): Observable<any> {
    return this.getColumnData(document, form).switchMap((colData) => {
      return this.getCsvData(colData, document, form);
    });
  }

  private getColumnData(document: Document, form: any): Observable<any> {
    const queue = [{obj: document, key: 'document'}];
    let next, obj, key;
    const colData = {};
    const labelObservables = [];

    while (queue.length > 0) {
      next = queue.shift();
      obj = next.obj;
      key = next.key;

      for (const i in obj) {
        if (!obj.hasOwnProperty(i) || obj[i] == null || i.charAt(0) === '@'
          || (i === 'id' && key !== 'document') || (Array.isArray(obj[i]) && obj[i].length < 1)) {
          continue;
        }

        let type;

        if (i === 'geometry' || typeof obj[i] !== 'object' || (Array.isArray(obj[i]) && typeof obj[i][0] !== 'object')) {
          type = 'column';
        } else if (Array.isArray(obj[i])) {
          type = 'objectArray';
          for (let j = 0; j < obj[i].length; j++) {
            if (!this.isEmpty(i, obj[i][j], form)) {
              queue.push({obj: obj[i][j], key: i});
            }
          }
        } else {
          type = 'object';
          queue.push({obj: obj[i], key: i});
        }

        if (!colData[key]) {
          colData[key] = [];
        }
        if (colData[key].filter(e => e.id === i).length === 0) {
          const col = {id: i, type: type, label: ''};
          colData[key].push(col);
          colData[key].sort((a, b) => {
            if (a.type === b.type) { return 0; }

            if (a.type === 'column' || (a.type === 'object' && b.type === 'objectArray')) {
              return -1;
            } else {
              return 1;
            }
          });
          if (col.type === 'column') {
            labelObservables.push(this.getLabel(i).do(label => col.label = label));
          }
        }
      }
    }

    return Observable.forkJoin(labelObservables, () => {
      return colData;
    });
  }

  private getCsvData(colData, obj, form, key = 'document', rows = [{}]): Observable<any[]> {
    let colIndex = 0;

    let appendColumnsToData = (): Observable<any[]> => {
      if (!colData[key] || colData[key].length < 1) { return Observable.of(rows); }

      const columns = colData[key];
      const rowObservables = [];

      while (colIndex < columns.length && columns[colIndex].type === 'column') {
        const col = columns[colIndex];
        const child = !obj ? null : obj[col.id];
        rowObservables.push(this.getColumnValue(col, child));
        colIndex++;
      }

      return Observable.forkJoin(rowObservables).map((array: any[]) => {
        for (let i = 0; i < array.length; i++) {
          for (let j = 0; j < rows.length; j++) {
            Object.assign(rows[j], array[i]);
          }
        }
        return rows;
      });
    };

    let appendObjectsToData = (): Observable<any[]> => {
      if (!colData[key] || colIndex >= colData[key].length) { return Observable.of(rows); }
      const col = colData[key][colIndex];
      const child = !obj ? null : obj[col.id];
      colIndex++;

      if (col.type === 'object' || child == null) {
        return this.getCsvData(colData, child, form, col.id, rows).switchMap(() => {
          return appendObjectsToData();
        });
      } else {
        const rowObservables = [];

        for (let j = 0; j < child.length; j++) {
          if (!this.isEmpty(col.id, child[j], form)) {
            rowObservables.push(this.getCsvData(colData, child[j], form, col.id, Util.clone(rows)));
          }
        }

        return Observable.forkJoin(rowObservables)
          .switchMap((array: any[]) => {
            if (array.length > 0) {
              rows.length = 0;
              for (let i = 0; i < array.length; i++) {
                rows.push.apply(rows, array[i]);
              }
              return appendObjectsToData();
            } else {
              return this.getCsvData(colData, null, form, col.id, rows).switchMap(() => {
                return appendObjectsToData();
              });
            }
          });
      }
    };

    appendColumnsToData = appendColumnsToData.bind(this);
    appendObjectsToData = appendObjectsToData.bind(this);

    return appendColumnsToData().switchMap(() => {
      return appendObjectsToData();
    });
  }

  private getColumnValue(col, object): Observable<any> {

    const getRawValue = (): Observable<any> => {
      let value = '';

      if (object != null) {
        if (col.id === 'geometry') {
          value += geoJSONToISO6709({
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              geometry: object.geometries ? object.geometries[0] : object,
            }]});
        } else if (Array.isArray(object)) {
          return Observable.from(object.map((labelKey) => {
            return this.getLabel(labelKey);
          }))
            .mergeAll()
            .toArray()
            .map((array) => {
              return array.join(', ');
            });
        } else {
          return this.getLabel(object);
        }
      }

      return Observable.of(value);
    };

    return getRawValue().map((value) => {
      value = String(value).replace(/\r?\n|\r/g, ' ').trim();
      return {[col.label]: value};
    });
  }

  private getLabel(key: string): Observable<string> {
    if (typeof key !== 'string') {
      return Observable.of(key);
    }

    if (key.match(/^MA\.[0-9]+$/)) {
      return this.userService
        .getUser(key)
        .map((user) => {
          return user.fullName || key;
        });
    }

    if (key.match(/^HR\.[0-9]+$/)) {
      return this.collectionService
        .getName(key, this.translate.currentLang)
        .map((name) => {
          return name.length > 0 && name[0].value ? name[0].value : key;
        });
    }

    return this.labelService
      .get(key, this.translate.currentLang)
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
