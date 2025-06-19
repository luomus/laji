import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { map, distinctUntilChanged, tap, takeUntil, switchMap, take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { IdentificationChildrenDataSource } from './identification-children-data-source';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';
import { MetadataService } from 'projects/laji/src/app/shared/service/metadata.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];

interface IIdentificationState {
  childDataSource?: IdentificationChildrenDataSource | undefined;
  totalChildren?: number;
}

const _state: IIdentificationState = {
  childDataSource: undefined,
  totalChildren: 0
};

const rankWhiteList = [
  'MX.superdomain',
  'MX.domain',
  'MX.kingdom',
  'MX.phylum',
  'MX.class',
  'MX.order',
  'MX.family',
  'MX.genus',
  'MX.species'
];

@Injectable()
export class TaxonIdentificationFacade implements OnDestroy {
  private readonly store = new BehaviorSubject<IIdentificationState>(_state);
  readonly state$ = this.store.asObservable();
  readonly childDataSource$ = this.state$.pipe(map((state) => state.childDataSource), distinctUntilChanged());
  readonly totalChildren$ = this.state$.pipe(map((state) => state.totalChildren), distinctUntilChanged());

  private unsubscribe$ = new Subject<void>();
  private taxonEnumReversed$ = this.metadataService.getRange('MX.taxonRankEnum').pipe(map(range => [...range].reverse().map(({id}) => id)));

  private getSubMainRank$(root: string): Observable<string> {
    const isMainRank = (r: string): boolean => rankWhiteList.includes(r);

    const findNearestParentMainRankIdx$ = (_root: string) =>
      this.taxonEnumReversed$.pipe(map(taxonEnumReversed => {
        const idx = taxonEnumReversed.indexOf(_root);
        const parent = taxonEnumReversed.slice(idx + 1).find(rank => isMainRank(rank));
        return rankWhiteList.findIndex(r => r === parent);
      }));

    return of(rankWhiteList.findIndex(r => r === root)).pipe(
        switchMap(rootIdx =>
          // Find the closest parent that is a mainrank, if the root isn't a main rank
          rootIdx < 0
            ? findNearestParentMainRankIdx$(root)
            : of(rootIdx)
        ),
        map(rootIdx => rankWhiteList[rootIdx + 1] || rankWhiteList[rootIdx]));
  }

  constructor(
    private api: LajiApiClientBService,
    private translate: TranslateService,
    private metadataService: MetadataService
  ) {}

  reducer(newState: IIdentificationState) {
    this.store.next({
      ...this.store.getValue(),
      ...newState
    });
  }

  loadChildDataSource(root: Taxon) {
    this.childDataSource$.pipe(take(1)).subscribe(d => {
      if (d) {
        d.disconnect();
      }
    });

    if (root.species || root.taxonRank === 'MX.species') {
      return;
    }

    this.getDataSourceObservable$(root.id, root.taxonRank).subscribe(d => this.reducer({childDataSource: d}));
  }

  private getTaxaObservable$(id: string, rank: string): Observable<any> {
    return this.api.post('/taxa', { query: {
      parentTaxonId: id,
      lang: this.translate.currentLang as any,
      sortOrder: 'observationCountFinland desc',
      selectedFields: 'id,vernacularName,scientificName,cursiveName,taxonRank,hasChildren,countOfSpecies,observationCountFinland,descriptions,multimedia',
      includeMedia: true,
    } }, {
      taxonRank: rank
    }).pipe(switchMap(res => {
        if (res.total > 0 || rank === 'MX.species') {
          return of({...res, rank});
        } else {
          return this.getSubMainRank$(rank).pipe(switchMap(_rank => this.getTaxaObservable$(id, _rank)));
        }
      }),
      takeUntil(this.unsubscribe$),
    );
  }

  private getDataSourceObservable$(id: string, rootRank: string) {
    return this.getSubMainRank$(rootRank).pipe(switchMap(rank =>
      this.getTaxaObservable$(id, rank).pipe(
        tap(res => this.reducer({totalChildren: res.total})),
        switchMap(res => this.getSubMainRank$(res.rank).pipe(
          map(_rank => new IdentificationChildrenDataSource(this.api, this.translate, res.results, _rank))
        ))
      )
    ));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
