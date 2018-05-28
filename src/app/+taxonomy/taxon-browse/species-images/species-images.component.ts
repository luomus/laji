import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TaxonomySearchQuery } from '../taxonomy-search-query.model';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { PagedResult } from '../../../shared/model/PagedResult';
import { Logger } from '../../../shared/logger/logger.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'laji-species-images',
  templateUrl: './species-images.component.html',
  styleUrls: ['./species-images.component.css']
})
export class SpeciesImagesComponent implements OnInit {
  @Input() searchQuery: TaxonomySearchQuery;
  loading = false;
  speciesPage: PagedResult<Taxonomy> = {
    currentPage: 1,
    lastPage: 1,
    results: [],
    total: 0,
    pageSize: 0
  };

  private lastQuery: string;
  private subFetch: Subscription;

  constructor(
    private taxonomyService: TaxonomyApi,
    private cd: ChangeDetectorRef,
    private logger: Logger,
    private translate: TranslateService
  ) {}

  ngOnInit() {
  }

  refreshImages() {
    const cacheKey = JSON.stringify({
      query: this.searchQuery.query,
      page: this.searchQuery.page,
      sortOrder: this.searchQuery.sortOrder,
      selected: this.searchQuery.selected
    });
    if (this.lastQuery === cacheKey) {
      return;
    }
    this.lastQuery = cacheKey;

    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.loading = true;

    this.subFetch = this.fetchPage(this.searchQuery.page)
      .subscribe(data => {
          this.speciesPage = data;
          this.loading = false;
          this.cd.markForCheck();
        },
        err => {
          this.logger.warn('Failed to fetch species images', err);
          this.loading = false;
          this.cd.markForCheck();
        }
      );
  }

  private fetchPage(page: number): Observable<PagedResult<Taxonomy>> {
    const query = this.searchQueryToTaxaQuery();

    return this.taxonomyService
      .taxonomyFindSpecies(
        query.target,
        this.translate.currentLang,
        query.informalTaxonGroupId,
        undefined,
        undefined,
        undefined,
        undefined,
        '' + page,
        '1000',
        this.searchQuery.sortOrder,
        query.extraParameters
      )
  }

  private searchQueryToTaxaQuery() {
    const query = this.searchQuery.query;
    const informalTaxonGroupId = query.informalTaxonGroupId;
    const target = query.target ? query.target : 'MX.37600';
    const extraParameters = {...query};
    extraParameters['target'] = undefined;
    extraParameters['informalTaxonGroupId'] = undefined;
    extraParameters['selectedFields'] = 'id, media';
    extraParameters['lang'] = 'multi';

    return {
      informalTaxonGroupId,
      target,
      extraParameters
    }
  }
}
