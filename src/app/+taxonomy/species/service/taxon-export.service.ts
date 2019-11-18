import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { from, Observable, of } from 'rxjs';
import { ExportService } from '../../../shared/service/export.service';
import { concatMap, map, toArray } from 'rxjs/operators';
import { DatatableColumn } from '../../../shared-modules/datatable/model/datatable-column';
import { Taxonomy } from '../../../shared/model/Taxonomy';

export const SYNONYM_KEYS = [
  'basionyms',
  'objectiveSynonyms',
  'subjectiveSynonyms',
  'homotypicSynonyms',
  'heterotypicSynonyms',
  'alternativeNames',
  'synonyms',
  'misspelledNames',
  'orthographicVariants',
  'uncertainSynonyms'
];

@Injectable({
  providedIn: 'root'
})
export class TaxonExportService {
  constructor(
    private translate: TranslateService,
    private exportService: ExportService
  ) {}

  public downloadTaxons(columns: DatatableColumn[], data: Taxonomy[], type = 'tsv', firstRow?: string[]): Observable<boolean> {
    return this.analyzeTaxa(columns, data)
      .pipe(
        concatMap(taxa => this.exportService.getAoa<Taxonomy>(columns, taxa, firstRow)),
        map(aoa => this.exportService.getBufferFromAoa(aoa, type)),
        map((buffer) => {
          this.exportService.exportArrayBuffer(buffer, this.translate.instant('taxon-export'), type);
          return true;
        })
      );
  }

  private analyzeTaxa(columns: DatatableColumn[], data: Taxonomy[]): Observable<Taxonomy[]> {
    return from(data).pipe(
      concatMap(taxon => this.analyzeTaxon(taxon)),
      toArray()
    );
  }

  private analyzeTaxon(data: Taxonomy): Observable<Taxonomy> {
    return of({
      ...data,
      synonymNames: this.pickSynonyms(data)
    });
  }

  private pickSynonyms(data: Taxonomy): string {
    const synonyms: string[] = [];
    SYNONYM_KEYS.forEach(key => {
      if (data[key] && Array.isArray(data[key])) {
        data[key].forEach(synonym => {
          synonyms.push(synonym.scientificName + (synonym.scientificNameAuthorship ? ' ' + synonym.scientificNameAuthorship : ''));
        });
      }
    });
    return synonyms.join('; ');
  }
}
