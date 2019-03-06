import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as XLSX from 'xlsx';
import { forkJoin as ObservableForkJoin, Observable, of as ObservableOf } from 'rxjs';
import { ExportService } from '../../../shared/service/export.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { DatatableUtil } from './datatable-util.service';
import { Util } from '../../../shared/service/util.service';
import { DatatableColumn } from '../../../shared-modules/datatable/model/datatable-column';
import { Taxonomy } from '../../../shared/model/Taxonomy';

@Injectable({
  providedIn: 'root'
})
export class TaxonExportService {
  constructor(
    private translate: TranslateService,
    private exportService: ExportService,
    private dtUtil: DatatableUtil
  ) {}

  public downloadTaxons(columns: DatatableColumn[], data: Taxonomy[], type = 'tsv', firstRow?: string[]): Observable<boolean> {
    return this.getBuffer(columns, data, type, firstRow)
      .pipe(
        switchMap((buffer) => {
          return this.translate.get('taxon-export')
            .pipe(
              map((fileName) => {
                this.exportService.exportArrayBuffer(buffer, fileName, type);
                return true;
              })
            );
        })
      );
  }

  private getBuffer(cols: DatatableColumn[], data: Taxonomy[], type, firstRow?: string[]): Observable<string> {
    return this.getAoa(cols, data, firstRow)
      .pipe(
        map((aoa) => {
          const sheet = XLSX.utils.aoa_to_sheet(aoa);

          if (type === 'tsv') {
            return XLSX.utils.sheet_to_csv(sheet, {FS: '\t'});
          }

          const book = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(book, sheet);

          return XLSX.write(book, {bookType: type, type: 'array'});
        })
      );
  }

  private getAoa(cols: DatatableColumn[], data: Taxonomy[], firstRow?: string[]): Observable<string[][]> {
    const aoa: any = firstRow ? [firstRow, []] : [[]];
    const labelRow = firstRow ? 1 : 0;
    const observables = [];
    for (let i = 0; i < cols.length; i++) {
      aoa[labelRow].push(cols[i].label);
      observables.push(
        this.translate.get(cols[i].label).pipe(tap((label) => {
          aoa[labelRow][i] = Array.isArray(cols[i].label) ? (cols[i].label as string[]).map(key => label[key]).join(', ') : label;
        }))
      );
    }
    for (let i = 0; i < data.length; i++) {
      aoa.push([]);
      for (let j = 0; j < cols.length; j++) {
        const value = Util.parseJSONPath(data[i], cols[j].name);
        const key = i + (firstRow ? 2 : 1);

        const template = cols[j].cellTemplate;
        aoa[key][j] = (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) ? '' : value;

        if (!template || aoa[key][j] === '') {
          continue;
        }

        const observable = this.dtUtil.getVisibleValue(value, template);

        if (observable) {
          observables.push(observable.pipe(tap(((val) => {
            aoa[key][j] = val;
          }))));
        }
      }
    }
    return observables.length > 0 ? ObservableForkJoin(observables).pipe(
      map(() => aoa)
    ) : ObservableOf(aoa);
  }
}
