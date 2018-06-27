import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TaxonomySearchQuery } from '../taxonomy-search-query.model';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { PagedResult } from '../../../shared/model/PagedResult';
import { Logger } from '../../../shared/logger/logger.service';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { Subscription ,  Observable } from 'rxjs';

@Component({
  selector: 'laji-species-images',
  templateUrl: './species-images.component.html',
  styleUrls: ['./species-images.component.css']
})
export class SpeciesImagesComponent implements OnInit, OnDestroy {
  @Input() searchQuery: TaxonomySearchQuery;
  loading = false;

  images = [];
  pageSize = 50;
  page = 1;
  total = 0;

  private subFetch: Subscription;
  private subQueryUpdate: Subscription;

  private lastQuery: string;

  constructor(
    private taxonomyService: TaxonomyApi,
    private cd: ChangeDetectorRef,
    private logger: Logger,
    private translate: TranslateService,
    private router: Router,
    private localizeRouterService: LocalizeRouterService
  ) {}

  ngOnInit() {
    this.refreshImages();

    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(
      () => {
        this.page = 1;
        this.refreshImages();
      }
    );
  }

  ngOnDestroy() {
    this.subQueryUpdate.unsubscribe();
  }

  pageChanged(event) {
    this.page = event.page;
    this.refreshImages();
  }

  onImageSelect(event) {
    this.router.navigate(this.localizeRouterService.translateRoute(['/taxon', event.taxonId]));
  }

  refreshImages() {
    const cacheKey = JSON.stringify({
      query: this.searchQuery.query,
      page: this.page
    });
    if (this.lastQuery === cacheKey) {
      return;
    }
    this.lastQuery = cacheKey;

    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.loading = true;

    this.subFetch = this.fetchPage(this.page)
      .subscribe(data => {
          this.images = data.results.map(res => {
            const image = res['multimedia'][0];
            image['vernacularName'] = res['vernacularName'];
            image['scientificName'] = res['scientificName'];
            image['taxonId'] = res['id'];
            return image;
          });
          this.total = data.total;
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
    const query = this.searchQuery.query;

    return this.taxonomyService
      .taxonomyFindSpecies(
        query.target ? query.target : 'MX.37600',
        this.translate.currentLang,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        '' + page,
        '50',
        this.searchQuery.sortOrder,
        {
          ...query,
          target: undefined,
          selectedFields: 'id,vernacularName,scientificName',
          hasMediaFilter: true,
          includeMedia: true
        }
      )
  }
}
