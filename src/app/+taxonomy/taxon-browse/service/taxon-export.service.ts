import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as XLSX from 'xlsx';
import { forkJoin as ObservableForkJoin, Observable, of as ObservableOf } from 'rxjs';
import { ExportService } from '../../../shared/service/export.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { DatatableUtil } from './datatable-util.service';
import { Util } from '../../../shared/service/util.service';

@Injectable()
export class TaxonExportService {
  constructor(
    private translate: TranslateService,
    private exportService: ExportService,
    private dtUtil: DatatableUtil
  ) {}

  public downloadTaxons(columns, data, type = 'tsv'): Observable<boolean> {
    return this.getBuffer(columns, data, type)
      .pipe(
        switchMap((buffer) => {
          return this.translate.get('taxon-export')
            .pipe(
              map((fileName) => {
                this.exportService.exportArrayBuffer(buffer, fileName, type);
                return true;
              })
            )
        })
      );
  }

  private getBuffer(cols, data, type): Observable<string> {
    return this.getAoa(cols, data)
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

  private getAoa(cols, data): Observable<string[][]> {
    const aoa = [[]];

    const observables = [];
    for (let i = 0; i < cols.length; i++) {
      aoa[0].push(cols[i].label);
      observables.push(
        this.translate.get(cols[i].label).do((label) => {
          aoa[0][i] = label;
        })
      );
    }
    for (let i = 0; i < data.length; i++) {
      aoa.push([]);
      for (let j = 0; j < cols.length; j++) {
        const value = Util.parseJSONPath(data[i], cols[j].name);

        const template = cols[j].cellTemplate;
        aoa[i + 1].push(value);

        if (value === undefined || value === null || !template) {
          continue;
        }

        const observable = this.dtUtil.getVisibleValue(value, template);

        if (observable) {
          observables.push(observable.pipe(tap(((val) => {
            aoa[i + 1][j] = val;
          }))));
        }
      }
    }

    return observables.length > 0 ? ObservableForkJoin(observables).pipe(
      map(() => aoa)
    ) : ObservableOf(aoa);
  }
}
