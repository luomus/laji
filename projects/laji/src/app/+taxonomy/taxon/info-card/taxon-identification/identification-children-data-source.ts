import { DataSource, CollectionViewer, ListRange } from '@angular/cdk/collections';
import { Taxonomy } from 'projects/laji/src/app/shared/model/Taxonomy';
import { Observable, of, Subject, forkJoin } from 'rxjs';
import { takeUntil, tap, map, concatMap } from 'rxjs/operators';
import { Taxon } from '../../../../../../../laji-api-client/src/lib/models';
import { TaxonomyApi } from 'projects/laji/src/app/shared/api/TaxonomyApi';
import { TranslateService } from '@ngx-translate/core';

const rangeToIter = (range: ListRange): number[] => {
  const arr = [];
  for (let i = range.start; i <= range.end; i++) {
    arr.push(i);
  }
  return arr;
};
const clamp = (val: number, min: number, max: number): number => Math.min(Math.max(val, min), max);
const clampRange = (range: ListRange, min: number, max: number): ListRange => ({
  start: clamp(range.start, min, max),
  end: clamp(range.end, min, max)
});

export class IdentificationChildrenDataSource extends DataSource<Taxonomy> {
  private unsubscribe$ = new Subject<void>();

  private childCache = {};

  constructor (
    private taxonApi: TaxonomyApi,
    private translate: TranslateService,
    private children: Taxonomy[],
    private grandchildRank: Taxon.TaxonRankEnum
  ) {
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<Taxonomy[]> {
    return collectionViewer.viewChange.pipe(
      takeUntil(this.unsubscribe$),
      map(range => this.children.length > 0 ? Array.from(rangeToIter(clampRange(range, 0, this.children.length - 1))) : []),
      concatMap(indices => forkJoin(...indices.map(i => this.childByIdx$(i))))
    );
  }

  disconnect(collectionViewer?: CollectionViewer): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private childByIdx$(childIdx: number): Observable<Taxonomy> {
    if (this.childCache[childIdx]) {
      return of(this.childCache[childIdx]);
    } else {
      return this.populateGrandchildren$(this.children[childIdx]).pipe(
        tap(t => this.childCache[childIdx] = t)
      );
    }
  }

  private populateGrandchildren$(child: Taxonomy): Observable<Taxonomy> {
    return this.taxonApi.taxonomyList(
      this.translate.currentLang,
      {
        parentTaxonId: child.id,
        taxonRanks: this.grandchildRank,
        sortOrder: 'observationCountFinland DESC',
        selectedFields: 'id,vernacularName,scientificName,cursiveName,taxonRank,hasChildren',
        includeMedia: true
      }
    ).pipe(
      map(taxa => ({...child, children: taxa.results}))
    );
  }
}
