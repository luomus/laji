import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ExportService } from '../../../shared/service/export.service';
import { map } from 'rxjs/operators';
import { DatatableColumn } from '../../../shared-modules/datatable/model/datatable-column';
import { Taxonomy } from '../../../shared/model/Taxonomy';

@Injectable({
  providedIn: 'root'
})
export class TaxonExportService {
  constructor(
    private translate: TranslateService,
    private exportService: ExportService
  ) {}

  public downloadTaxons(columns: DatatableColumn[], data: Taxonomy[], type = 'tsv', firstRow?: string[]): Observable<boolean> {
    return this.exportService.getAoa<Taxonomy>(columns, data, firstRow)
      .pipe(
        map(aoa => this.exportService.getBufferFromAoa(aoa, type)),
        map((buffer) => {
          this.exportService.exportArrayBuffer(buffer, this.translate.instant('taxon-export'), type);
          return true;
        })
      );
  }
}
