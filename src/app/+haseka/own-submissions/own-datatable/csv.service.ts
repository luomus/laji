import { Injectable } from '@angular/core';
import { Document } from '../../../shared/model/Document';
import { Util } from '../../../shared/service/util.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * Csv service
 */
@Injectable()
export class CsvService {
  private delimeter = ',';

  constructor(
    private translate: TranslateService
  ) {}

  public downloadDocumentAsCsv(doc: Document) {
    const uri = encodeURI(this.documentToCsv(doc));

    const downloadLink = document.createElement('a');
    downloadLink.href = uri;

    this.translate.get('haseka.submissions.submission').subscribe((msg) => {
      downloadLink.download = msg + '_' + doc.id.split('.')[1] + '.csv';

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  }

  public documentToCsv(document: Document) {
    let csv = 'data:text/csv;charset=utf-8, ';

    const filteredFields = ['geometry'];

    const colData = this.getColumnData(document, filteredFields);
    csv += this.getColString(colData);

    const rows = this.getRowStrings(colData, document);
    for (let i = 0; i < rows.length; i++) {
      csv += '\n';
      csv += rows[i];
    }
    return csv;
  }


  private getColumnData(document: Document, filtered: String[]): any {
    const queue = [{obj: document, key: 'document'}];
    let next, obj, key;
    const colData = {};

    while (queue.length > 0) {
      next = queue.shift();
      obj = next.obj;
      key = next.key;

      for (const i in obj) {
        if (!obj.hasOwnProperty(i) || i.charAt(0) === '@') {
          continue;
        }

        if (obj[i] != null && filtered.indexOf(i) === -1 && (i !== 'id' || key === 'document')) {
          let type;

          if (typeof obj[i] !== 'object' || (Array.isArray(obj[i]) && typeof obj[i][0] !== 'object')) {
            type = 'column';
          } else if (Array.isArray(obj[i])) {
            type = 'objectArray';
            for (let j = 0; j < obj[i].length; j++) {
              queue.push({obj: obj[i][j], key: i});
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

  private getRowStrings(colData, obj, key = 'document', rows = ['']) {
    if (colData[key]) {
      for (let i = 0; i < colData[key].length; i++) {
        const col = colData[key][i];
        let child;
        if (!obj || (col.type === 'objectArray' && obj[col.name].length < 1)) {
          child = null;
        } else {
          child = obj[col.name];
        }

        if (col.type === 'column') {
          let value = '';

          if (child != null) {
            if (Array.isArray(obj[col])) {
              value += child.join(', ');
            } else {
              value += child;
            }
            if (value.indexOf(this.delimeter) !== -1 || value.indexOf('\n') !== -1) {
              value = '"' + value + '"';
            }
          }

          for (let j = 0; j < rows.length; j++) {
            if (i !== 0 || rows[j] !== '') {
              rows[j] += this.delimeter + ' ';
            }
            rows[j] += value;
          }
        } else if (col.type === 'object' || child === null) {
          if (!child) { child = {}; }
          rows = this.getRowStrings(colData, child, col.name, rows);
        } else {
          const rowData = rows;
          rows = [];
          for (let j = 0; j < child.length; j++) {
            const h = this.getRowStrings(colData, child[j], col.name, Util.clone(rowData));
            rows = rows.concat(h);
          }
        }
      }
    }

    return rows;
  }
}
