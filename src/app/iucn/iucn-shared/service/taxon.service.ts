import { Injectable } from '@angular/core';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { Observable, of as ObservableOf } from 'rxjs';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import {map, tap} from 'rxjs/operators';
import { RedListTaxonGroup } from '../../../shared/model/RedListTaxonGroup';
import { RedListTaxonGroupApi } from '../../../shared/api/RedListTaxonGroupApi';

@Injectable({
  providedIn: 'root'
})
export class TaxonService {

  private treeCache = {};

  constructor(
    private taxonApi: TaxonomyApi,
    private redList: RedListTaxonGroupApi
  ) { }

  getTaxon(id: string, lang: string): Observable<Taxonomy> {
    return this.taxonApi.taxonomyFindBySubject(id, lang, {includeMedia: true, includeRedListEvaluations: true}).pipe(
      map(data => this.mock(data))
    );
  }

  getRedListStatusTree(lang: string): Observable<RedListTaxonGroup[]> {
    if (this.treeCache[lang]) {
      return ObservableOf(this.treeCache[lang]);
    }
    return this.redList.redListTaxonGroupsGetTree(lang).pipe(
      map(data => data.results),
      tap(data => this.treeCache[lang] = data)
    );
  }

  private mock(taxon: Taxonomy): Taxonomy {
    if (taxon.redListStatusesInFinland) {
      taxon.redListStatusesInFinland.unshift({year: 2019, status: 'MX.statusNT'});
    }
    return taxon;
  }
}
