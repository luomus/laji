import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { map, distinctUntilChanged, tap, takeUntil } from 'rxjs/operators';
import { Taxonomy } from 'projects/laji/src/app/shared/model/Taxonomy';
import { Taxon } from '../../../../../../../laji-api-client/src/lib/models';
import { TaxonomyApi } from 'projects/laji/src/app/shared/api/TaxonomyApi';
import { TranslateService } from '@ngx-translate/core';
import { IdentificationChildrenDataSource } from './identification-children-data-source';

interface IIdentificationState {
  childDataSource?: IdentificationChildrenDataSource | undefined;
  totalChildren?: number;
}

const _state: IIdentificationState = {
  childDataSource: undefined,
  totalChildren: 0
};

const rankWhiteList: Taxon.TaxonRankEnum[] = [
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

const isMainRank = (r: Taxon.TaxonRankEnum): boolean => {
  return rankWhiteList.includes(r);
};

const findNearestParentMainRankIdx = (root: Taxon.TaxonRankEnum): number => {
    const ranks = Object.values(Taxon.TaxonRankEnum);
    const idx = ranks.indexOf(root);
    const rank0 = ranks.slice(idx).find(rank => isMainRank(rank));
    return rankWhiteList.findIndex(r => r === rank0) - 1;

};

const getSubMainRanks = (root: Taxon.TaxonRankEnum): Taxon.TaxonRankEnum[] => {
  let rootIdx = rankWhiteList.findIndex(r => r === root);
  if (rootIdx < 0) {
    // Root is not a main rank
    // find the closest parent that is mainrank instead
    rootIdx = findNearestParentMainRankIdx(root);
  }
  return [rankWhiteList[rootIdx + 1], rankWhiteList[rootIdx + 2]];
};

@Injectable()
export class TaxonIdentificationFacade implements OnDestroy {
  private readonly store = new BehaviorSubject<IIdentificationState>(_state);
  readonly state$ = this.store.asObservable();
  readonly childDataSource$ = this.state$.pipe(map((state) => state.childDataSource), distinctUntilChanged());
  readonly totalChildren$ = this.state$.pipe(map((state) => state.totalChildren), distinctUntilChanged());

  private unsubscribe$ = new Subject<void>();

  constructor(private taxonApi: TaxonomyApi, private translate: TranslateService) {}

  reducer(newState: IIdentificationState) {
    this.store.next({
      ...this.store.getValue(),
      ...newState
    });
  }

  loadChildDataSource(root: Taxonomy) {
    this.childDataSource$.pipe(takeUntil(this.unsubscribe$)).subscribe(d => {
      if (d) {
        d.disconnect();
      }
    });

    if (root.species || root.taxonRank === 'MX.species') {
      return;
    }

    const [rank1, rank2] = getSubMainRanks(<Taxon.TaxonRankEnum>root.taxonRank);

    this.taxonApi.taxonomyList(
      this.translate.currentLang,
      {
        parentTaxonId: root.id,
        taxonRanks: rank1,
        sortOrder: 'observationCountFinland DESC',
        selectedFields: 'id,vernacularName,scientificName,cursiveName,taxonRank,hasChildren,countOfSpecies,observationCountFinland',
        includeMedia: true
      }
    ).pipe(
      takeUntil(this.unsubscribe$),
      tap(res => this.reducer({totalChildren: res.total})),
      map(res => new IdentificationChildrenDataSource(this.taxonApi, this.translate, res.results, rank2))
    ).subscribe(d => this.reducer({childDataSource: d}));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
