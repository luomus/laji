import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { ExportService } from '../../../shared/service/export.service';
import { concatMap, map, toArray } from 'rxjs/operators';
import { DatatableColumn } from '../../../shared-modules/datatable/model/datatable-column';
import { BookType } from 'xlsx';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];
type SimpleTaxon = components['schemas']['SimpleTaxon'];

type SimpleTaxonArrayKeys = {
    [K in keyof Taxon]: Taxon[K] extends SimpleTaxon[] ? K : never
}[keyof Taxon];

export const SYNONYM_KEYS: SimpleTaxonArrayKeys[] = [
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

  public downloadTaxons(columns: DatatableColumn[], data: Taxon[], type = 'tsv', firstRow?: string[]): Observable<boolean> {
    return this.analyzeTaxa(data)
      .pipe(
        concatMap(taxa => this.exportService.exportFromData(taxa, columns, type as BookType, 'taxon-export', firstRow)),
        map(() => true)
      );
  }

  private analyzeTaxa(data: Taxon[]): Observable<Taxon[]> {
    return from(data).pipe(
      concatMap(taxon => this.analyzeTaxon(taxon)),
      toArray()
    );
  }

  private analyzeTaxon(data: Taxon): Observable<Taxon> {
    return of({
      ...data,
      synonymNames: this.pickSynonyms(data),
      misappliedListNames: this.pickMisappliedNames(data)
    });
  }

  private pickSynonyms(data: Taxon): string {
    const synonyms: string[] = [];
    SYNONYM_KEYS.forEach(key => {
      const value = data[key];
      if (Array.isArray(value)) {
        value.forEach((synonym: SimpleTaxon) => {
          synonyms.push(synonym.scientificName + (synonym.scientificNameAuthorship ? ' ' + synonym.scientificNameAuthorship : ''));
        });
      }
    });
    return synonyms.join('; ');
  }

  private pickMisappliedNames(data: Taxon): string {
    const misappliedNames: string[] = [];
      if (data['misappliedNames'] && Array.isArray(data['misappliedNames'])) {
        data['misappliedNames'].forEach((misappliedName: any) => {
          misappliedNames.push(misappliedName.scientificName + (misappliedName.scientificNameAuthorship ? ' ' + misappliedName.scientificNameAuthorship : ''));
        });
      }
    return misappliedNames.join('; ');
  }
}
