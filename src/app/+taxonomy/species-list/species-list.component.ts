import { Component, Input, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { TaxonomyApi } from '../../shared/api/TaxonomyApi';
import { Taxonomy } from '../../shared/model/Taxonomy';
import { TranslateService } from 'ng2-translate';
import { PagedResult } from '../../shared/model/PagedResult';
import { InformalTaxonGroup } from '../../shared';
import { Logger } from '../../shared/logger/logger.service';


@Component({
  selector: 'laji-species-list',
  templateUrl: 'species-list.component.html',
  styleUrls: ['species-list.component.css'],
  providers: []
})
export class SpeciesListComponent implements OnChanges {

  @Input() informalGroup: InformalTaxonGroup;

  loading: boolean = false;
  speciesPage: PagedResult<Taxonomy[]>;

  private subFetch: Subscription;

  constructor(
    private taxonomyService: TaxonomyApi,
    private translate: TranslateService,
    private logger: Logger
  ) { }

  ngOnChanges() {
    if (this.informalGroup) {
      this.loading = true;
      this.refreshSpeciesList();
    }
  }

  pageChanged(event) {
    this.refreshSpeciesList(event.page);
  }

  refreshSpeciesList(page = 1) {
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.subFetch = this.taxonomyService
      .taxonomyFindSpecies(
        'MX.37600',
        this.translate.currentLang,
        this.informalGroup.id,
        undefined,
        undefined,
        undefined,
        undefined,
        `${page}`,
        undefined,
        // 'finnish_name'
      )
      .subscribe(data => {
          this.speciesPage = data;
          this.loading = false;
        },
        err => this.logger.warn('Failed to fetch species list', err)
      );
  }
}
