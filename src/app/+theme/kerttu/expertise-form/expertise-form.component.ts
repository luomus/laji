import {Component, OnInit} from '@angular/core';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {TaxonomyApi} from '../../../shared/api/TaxonomyApi';
import {Taxonomy} from '../../../shared/model/Taxonomy';

@Component({
  selector: 'laji-expertise-form',
  templateUrl: './expertise-form.component.html',
  styleUrls: ['./expertise-form.component.scss']
})
export class ExpertiseFormComponent implements OnInit {
  private birdId = 'MX.37580';

  columns = [{prop: 'vernacularName'}];

  taxonList$: Observable<Taxonomy[]>;

  private countThreshold = 50;

  constructor(
    private taxonomyService: TaxonomyApi
  ) { }

  ngOnInit() {
    this.taxonList$ = this.taxonomyService
      .taxonomyFindSpecies(
        this.birdId,
        'fi',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        '1',
        '1000',
        undefined,
        {
          selectedFields: ['id', 'vernacularName', 'scientificName', 'cursive', 'observationCount'],
          onlyFinnish: true,
          taxonRanks: ['MX.species']
        }
      ).pipe(
        map((result) => result.results),
        map((result) => result.reduce((arr, taxon) => {
          if (taxon.observationCount > this.countThreshold) {
            arr.push(taxon);
          }
          return arr;
        }, []))
      );
  }

  onSelect(event) {

  }

}
