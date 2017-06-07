import { Injectable } from '@angular/core';
import { Document } from '../../../shared/model/Document';
import { Util } from '../../../shared/service/util.service';
import { TranslateService } from '@ngx-translate/core';
import { geoJSONToISO6709 } from 'laji-map/lib/utils';

/**
 * Csv service
 */
@Injectable()
export class CsvService {
  private delimeter = ',';

  constructor(
    private translate: TranslateService
  ) {}

  public downloadDocumentAsCsv(doc: Document, form: any) {
    const uri = encodeURI(this.documentToCsv(doc, form));

    const downloadLink = document.createElement('a');
    downloadLink.href = uri;

    this.translate.get('haseka.submissions.submission').subscribe((msg) => {
      downloadLink.download = msg + '_' + doc.id.split('.')[1] + '.csv';

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  }

  private documentToCsv(document: Document, form: any) {
    let csv = 'data:text/csv;charset=utf-8, ';

    const colData = this.getColumnData(document, form);
    csv += this.getColString(colData);

    const rows = this.getRowStrings(colData, document, form);
    for (let i = 0; i < rows.length; i++) {
      csv += '\n';
      csv += rows[i];
    }
    return csv;
  }


  private getColumnData(document: Document, form: any): any {
    const queue = [{obj: document, key: 'document'}];
    let next, obj, key;
    const colData = {};

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
        if (colData[key].filter(e => e.name === i).length === 0) {
          colData[key].push({name: i, type: type});
        }
      }
    }
    return colData;
  }

  private getColString(colData: any, key = 'document', colString = ''): string {
    const cols = colData[key] ? colData[key] : [];
    cols.sort((a, b) => {
      if (a.type === b.type) { return 0; }

      if (a.type === 'column' || (a.type === 'object' && b.type === 'objectArray')) {
        return -1;
      } else {
        return 1;
      }
    });

    for (let i = 0; i < cols.length; i++) {
      const col = cols[i];

      if (col.type === 'column') {
        if (colString !== '') { colString += this.delimeter + ' '; }
        colString += col.name;
      } else {
        colString = this.getColString(colData, col.name, colString);
      }
    }

    return colString;
  }

  private getRowStrings(colData, obj, form, key = 'document', rows = ['']) {
    if (colData[key]) {
      for (let i = 0; i < colData[key].length; i++) {
        const col = colData[key][i];
        const child = !obj ? null : obj[col.name];

        if (col.type === 'column') {
          const value = this.getColumnValue(col.name, child);
          this.appendValueToRows(value, rows);
        } else if (col.type === 'object' || child == null) {
          rows = this.getRowStrings(colData, child, form, col.name, rows);
        } else {
          const rowData = rows;
          rows = [];
          for (let j = 0; j < child.length; j++) {
            if (!this.isEmpty(col.name, child[j], form)) {
              const row = this.getRowStrings(colData, child[j], form, col.name, Util.clone(rowData));
              rows = rows.concat(row);
            }
          }

          if (rows.length < 1) { rows = this.getRowStrings(colData, null, form, col.name, rowData); }
        }
      }
    }

    return rows;
  }

  private getColumnValue(key, object): string {
    let value = '';

    if (object != null) {
      if (key === 'geometry') {
        value += geoJSONToISO6709({
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: object.geometries ? object.geometries[0] : object,
          }]});
      } else if (Array.isArray(object)) {
        value += object.join(', ');
      } else {
        value += object;
      }
    }

    return value;
  }

  private appendValueToRows(value: string, rows: any) {
    value = value.replace(/\r?\n|\r/g, ' ');
    value = value.replace('"', '\'');

    for (let j = 0; j < rows.length; j++) {
      if (rows[j] !== '') {
        rows[j] += this.delimeter + ' ';
      }
      rows[j] += '"' +  value.trim() + '"';
    }
  }

  private isEmpty(key: string, obj: any, form: any) {
    if (key === 'gatherings') {
      if (!obj.units || obj.units.length < 1) { return true; }

      for (let i = 0; i < obj.units.length; i++) {
        const unit = obj.units[i];

        if (form.features && form.features.indexOf('MHL.featurePrepopulateWithInformalTaxonGroups') !== -1) {
          if (unit.count || unit.individualCount || unit.pairCount || unit.abundanceString) {
            return false;
          }
        }

        if (unit.identifications) {
          for (let j = 0; j < unit.identifications.length; j++) {
            const ident = unit.identifications[j];

            if (unit.informalNameString || ident.taxon || ident.taxonID || ident.taxonVerbatim) {
              return false;
            }
          }
        }
      }

      return true;
    }

    return false;
  }
}
