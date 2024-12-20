import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { ExportService } from '../../../shared/service/export.service';
import { concatMap, map, toArray } from 'rxjs/operators';
import { DatatableColumn } from '../../../shared-modules/datatable/model/datatable-column';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { BookType } from 'xlsx';

export const SYNONYM_KEYS: (keyof Taxonomy)[] = [
  'basionyms',
  'objectiveSynonyms',
  'subjectiveSynonyms',
  'homotypicSynonyms',
  'heterotypicSynonyms',
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
    private exportService: ExportService
  ) {}

  public downloadTaxons(columns: DatatableColumn[], data: Taxonomy[], type = 'tsv', firstRow?: string[]): Observable<boolean> {
    return this.analyzeTaxa(data)
      .pipe(
        concatMap(taxa => this.exportService.exportFromData(taxa, columns, type as BookType, 'taxon-export', firstRow)),
        map(() => true)
      );
  }

  private analyzeTaxa(data: Taxonomy[]): Observable<Taxonomy[]> {
    return from(data).pipe(
      concatMap(taxon => this.analyzeTaxon(taxon)),
      toArray()
    );
  }

  private analyzeTaxon(data: Taxonomy): Observable<Taxonomy> {
    return of({
      ...data,
      synonymNames: this.pickSynonyms(data),
      misappliedListNames: this.pickMisappliedNames(data)
    });
  }

  private pickSynonyms(data: Taxonomy): string {
    const synonyms: string[] = [];
    SYNONYM_KEYS.forEach(key => {
      if (data[key] && Array.isArray(data[key])) {
        data[key].forEach((synonym: Taxonomy) => {
          synonyms.push(synonym.scientificName + (synonym.scientificNameAuthorship ? ' ' + synonym.scientificNameAuthorship : ''));
        });
      }
    });
    return synonyms.join('; ');
  }

  private pickMisappliedNames(data: Taxonomy): string {
    const misappliedNames: string[] = [];
      if (data['misappliedNames'] && Array.isArray(data['misappliedNames'])) {
        data['misappliedNames'].forEach((misappliedName: any) => {
          misappliedNames.push(misappliedName.scientificName + (misappliedName.scientificNameAuthorship ? ' ' + misappliedName.scientificNameAuthorship : ''));
        });
      }
    return misappliedNames.join('; ');
  }
}
