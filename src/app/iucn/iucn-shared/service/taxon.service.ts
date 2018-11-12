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
    return this.taxonApi.taxonomyFindBySubject(id, lang, {includeMedia: true}).pipe(
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
      taxon.redListStatusesInFinland = taxon.redListStatusesInFinland.map((status, idx) => {
        (status as any).criteria = ['D1', 'A2bf+F2s', 'R2 D2', 'C+3F3D', 'C3PO', 'R2-D2'][idx % 6];
        (status as any).reasons = ['Pyynti\nRakentaminen maalla', '', '', '', '', 'Piip piip'][idx % 6];
        (status as any).threats = ['Pyynti', '', '', '', 'Eksyminen', 'Lyhyet jalat'][idx % 6];
        return status;
      })
    }
    return taxon;
  }
}
