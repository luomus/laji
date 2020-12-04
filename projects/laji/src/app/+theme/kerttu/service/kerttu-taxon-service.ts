import { Injectable } from '@angular/core';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { Observable } from 'rxjs';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class KerttuTaxonService {
  private birdsId = 'MX.37580';
  private countThreshold = 50;

  constructor(
    private translate: TranslateService,
    private taxonomyService: TaxonomyApi
  ) { }

  public getTaxonList(): Observable<Taxonomy[]> {
    return this.taxonomyService
      .taxonomyFindSpecies(
        this.birdsId,
        this.translate.currentLang,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        '1',
        '1000',
        'taxonomic',
        {
          selectedFields: ['id', 'vernacularName', 'scientificName', 'cursiveName', 'observationCountFinland'],
          onlyFinnish: true,
          taxonRanks: ['MX.species']
        }
      ).pipe(
      map((result) => result.results),
      map((result) => result.reduce((arr, taxon) => {
        if (taxon.observationCountFinland > this.countThreshold) {
          arr.push(taxon);
        }
        return arr;
      }, []))
    );
  }

  public getTaxon(id: string): Observable<Taxonomy> {
    return this.taxonomyService.taxonomyFindBySubject(
      id, this.translate.currentLang, {selectedFields: ['vernacularName', 'scientificName', 'cursiveName']}
    );
  }
}
