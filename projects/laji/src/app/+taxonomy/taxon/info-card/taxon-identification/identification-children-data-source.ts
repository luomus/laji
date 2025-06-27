import { DataSource, CollectionViewer, ListRange } from '@angular/cdk/collections';
import { Observable, of, Subject, forkJoin } from 'rxjs';
import { takeUntil, tap, map, concatMap } from 'rxjs/operators';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];

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

export class IdentificationChildrenDataSource extends DataSource<Taxon & { children: Taxon[] }> {
  private unsubscribe$ = new Subject<void>();

  private childCache: Record<string, Taxon & { children: Taxon[] }> = {};

  constructor(
    private api: LajiApiClientBService,
    private children: Taxon[],
    private grandchildRank: string
  ) {
    super();
  }

  connect(collectionViewer: CollectionViewer) {
    return collectionViewer.viewChange.pipe(
      takeUntil(this.unsubscribe$),
      map(range => this.children.length > 0 ? Array.from(rangeToIter(clampRange(range, 0, this.children.length - 1))) : []),
      concatMap(indices => forkJoin(...indices.map(i => this.childByIdx$(i))))
    );
  }

  disconnect(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private childByIdx$(childIdx: number) {
    if (this.childCache[childIdx]) {
      return of(this.childCache[childIdx]);
    } else {
      return this.populateGrandchildren$(this.children[childIdx]).pipe(
        tap(t => this.childCache[childIdx] = t)
      );
    }
  }

  private populateGrandchildren$(child: Taxon): Observable<Taxon & { children: Taxon[] }> {
    return this.api.post('/taxa', { query: {
      parentTaxonId: child.id,
      sortOrder: 'observationCountFinland desc',
      selectedFields: 'id,vernacularName,scientificName,cursiveName,taxonRank,hasChildren,multimedia',
      includeMedia: true
    }}, {
      taxonRank: this.grandchildRank,
    }).pipe(
      map(taxa => ({...child, children: taxa.results}))
    );
  }
}
