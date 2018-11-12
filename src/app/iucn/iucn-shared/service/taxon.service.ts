import { Injectable } from '@angular/core';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { Observable } from 'rxjs';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TaxonService {

  constructor(
    private taxonApi: TaxonomyApi
  ) { }

  getTaxon(id: string, lang: string): Observable<Taxonomy> {
    return this.taxonApi.taxonomyFindBySubject(id, lang, {includeMedia: true}).pipe(
      map(data => this.mock(data))
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
