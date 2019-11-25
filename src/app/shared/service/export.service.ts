import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import {utils as XLSXUtils} from 'xlsx';
import { DatatableColumn } from '../../shared-modules/datatable/model/datatable-column';
import { forkJoin as ObservableForkJoin, Observable, of as ObservableOf } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Util } from './util.service';
import { TranslateService } from '@ngx-translate/core';
import { DatatableUtil } from '../../shared-modules/datatable/service/datatable-util.service';
import { TriplestoreLabelService } from './triplestore-label.service';

@Injectable({providedIn: 'root'})
export class ExportService {
  private csvMimeType = 'text/csv;charset=utf-8';
  private tsvMimeType = 'text/tab-separated-values';
  private odsMimeType = 'application/vnd.oasis.opendocument.spreadsheet';
  private xlsxMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  constructor(
    private translateService: TranslateService,
    private datatableUtil: DatatableUtil,
    private triplestoreLabelService: TriplestoreLabelService
  ) { }

  exportArrayBuffer(buffer: any, fileName: string, fileExtension: string) {
    let type;
    if (fileExtension === 'ods') {
      type = this.odsMimeType;
    } else if (fileExtension === 'xlsx') {
      type = this.xlsxMimeType;
    } else if (fileExtension === 'tsv') {
      type = this.tsvMimeType;
    } else {
      type = this.csvMimeType;
    }

    const data: Blob = new Blob([buffer], {
      type: type
    });

    FileSaver.saveAs(data, fileName + '.' + fileExtension);
  }

  getBufferFromAoa(aoa: string[][], fileType: any): any {
    const sheet = XLSX.utils.aoa_to_sheet(aoa);

    if (fileType === 'csv') {
      return XLSXUtils.sheet_to_csv(sheet);
    }

    if (fileType === 'tsv') {
      return XLSX.utils.sheet_to_csv(sheet, {FS: '\t'});
    }

    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet);

    return XLSX.write(book, {bookType: fileType, type: 'array'});
  }

  public getAoa<T>(cols: DatatableColumn[], data: T[], firstRow?: string[]): Observable<string[][]> {
    const aoa: any = firstRow ? [firstRow, []] : [[]];
    const labelRow = firstRow ? 1 : 0;
    const observables = [];
    for (let i = 0; i < cols.length; i++) {
      const labels = this.translateService.instant(cols[i].label);
      aoa[labelRow].push(typeof labels === 'string' ? labels : Object.values(labels).join(', '));
    }
    for (let i = 0; i < data.length; i++) {
      aoa.push([]);
      for (let j = 0; j < cols.length; j++) {
        const value = this.getValue(data[i], cols[j]);
        const key = i + (firstRow ? 2 : 1);

        const template = cols[j].cellTemplate;
        aoa[key][j] = this.hasScalarValue(value) ? value : (Array.isArray(value) ? value.join('; ') : '');

        if (!template) {
          continue;
        }

        const observable = this.datatableUtil.getVisibleValue(value, data[i], template);
        observables.push(observable.pipe(map(((val) => {
          if (this.hasScalarValue(val)) {
            aoa[key][j] = val;
          }
        }))));
      }
    }
    return observables.length > 0 ? ObservableForkJoin(observables).pipe(
      map(() => aoa)
    ) : ObservableOf(aoa);
  }

  private getValue(obj: any, col: DatatableColumn) {
    const nameValue = Util.parseJSONPath(obj, col.name);
    if (!this.hasScalarValue(nameValue) && typeof col.prop !== 'undefined') {
      const propValue = Util.parseJSONPath(obj, '' + col.prop);
      if (typeof propValue !== 'undefined') {
        return propValue;
      }
    }
    return nameValue;
  }

  private hasScalarValue(value: any): boolean {
    const type = typeof value;
    return ['boolean', 'number', 'string'].includes(type);
  }
}
