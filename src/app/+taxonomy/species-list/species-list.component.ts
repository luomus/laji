import {Component, OnInit, Input, OnChanges} from '@angular/core';
import {Subscription} from "rxjs";

import {TaxonomyApi} from "../../shared/api/TaxonomyApi";
import {Taxonomy} from "../../shared/model/Taxonomy";
import {TranslateService} from "ng2-translate";
import {PagedResult} from "../../shared/model/PagedResult";


@Component({
  selector: 'laji-species-list',
  templateUrl: 'species-list.component.html',
  providers: [ ]
})
export class SpeciesListComponent implements OnChanges {

  @Input() informalGroup;

  loading:boolean = false;
  speciesPage:PagedResult<Taxonomy[]>;

  private subFetch:Subscription;

  constructor(
    private taxonomyService:TaxonomyApi,
    private translate:TranslateService
  ) {
  }

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.informalGroup) {
      this.loading = true;
      this.refreshSpeciesList();
    }
  }

  refreshSpeciesList() {
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.subFetch = this.taxonomyService
      .taxonomyFindSpecies(
        'MX.37600',
        this.translate.currentLang,
        this.informalGroup
      )
      .subscribe(
        data => {
          this.speciesPage = data;
          this.loading = false;
        },
        err => console.log(err)
      )
  }
}
