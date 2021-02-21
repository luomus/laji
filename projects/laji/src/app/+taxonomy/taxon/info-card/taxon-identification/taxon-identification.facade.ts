import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { map, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Taxonomy } from 'projects/laji/src/app/shared/model/Taxonomy';
import { Taxon } from '../../../../../../../laji-api-client/src/lib/models';
import { TaxonomyApi } from 'projects/laji/src/app/shared/api/TaxonomyApi';
import { TranslateService } from '@ngx-translate/core';
import { TaxonomyModule } from '../../../taxonomy.module';

interface IIdentificationState {
  childTree: Taxonomy[];
}

const _state: IIdentificationState = {
  childTree: undefined
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

const getSubMainRanks = (root: Taxon.TaxonRankEnum): Taxon.TaxonRankEnum[] => {
  let rootIdx = rankWhiteList.findIndex(r => r === root);
  if (rootIdx < 0) {
    // Root is not a main rank
    // find the closest parent that is mainrank instead
    const ranks = Object.values(Taxon.TaxonRankEnum);
    const idx = ranks.indexOf(root);
    const rank0 = ranks.slice(idx).find(rank => isMainRank(rank));
    rootIdx = rankWhiteList.findIndex(r => r === rank0) - 1;
  }
  return [rankWhiteList[rootIdx + 1], rankWhiteList[rootIdx + 2]];
};

@Injectable()
export class TaxonIdentificationFacade {
  private readonly store = new BehaviorSubject<IIdentificationState>(_state);
  readonly state$ = this.store.asObservable();
  readonly childTree$ = this.state$.pipe(map((state) => state.childTree), distinctUntilChanged());

  constructor(private taxonomyApi: TaxonomyApi, private translate: TranslateService) {}

  childTreeReducer(childTree: Taxonomy[]) {
    this.store.next({
      childTree
    });
  }

  loadChildTree(root: Taxonomy) {
    const [rank1, rank2] = getSubMainRanks(<Taxon.TaxonRankEnum>root.taxonRank);
    this.taxonomyApi.taxonomyList(
      this.translate.currentLang,
      {
        parentTaxonId: root.id,
        taxonRanks: rank1,
        sortOrder: 'observationCountFinland DESC',
        selectedFields: 'id,vernacularName,scientificName,cursiveName,taxonRank,hasChildren,countOfSpecies,observationCountFinland'
      }
    ).pipe(
      switchMap(res => {
        return forkJoin(
          res.results.map(
            taxon => this.taxonomyApi.taxonomyList(
              this.translate.currentLang,
              {
                parentTaxonId: taxon.id,
                taxonRanks: rank2,
                sortOrder: 'observationCountFinland DESC',
                selectedFields: 'id,vernacularName,scientificName,cursiveName,taxonRank,hasChildren',
                includeMedia: true
              }
            ).pipe(map(inner => ({...taxon, children: inner.results})))
          )
        );
      })
    ).subscribe(this.childTreeReducer.bind(this));
  }
}
