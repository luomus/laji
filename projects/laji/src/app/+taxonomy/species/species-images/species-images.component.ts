import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TaxonomySearchQuery } from '../service/taxonomy-search-query';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { PagedResult } from '../../../shared/model/PagedResult';
import { Logger } from '../../../shared/logger/logger.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'laji-species-images',
  templateUrl: './species-images.component.html',
  styleUrls: ['./species-images.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesImagesComponent implements OnInit, OnDestroy {
  @Input({ required: true }) searchQuery!: TaxonomySearchQuery;
  @Input() showSpeciesTotalCount = false;
  @Input() countStartText = '';
  @Input() countEndText = '';
  loading = false;

  images: any[] = [];
  pageSize = 50;
  total = 0;

  private subFetch?: Subscription;
  private subQueryUpdate?: Subscription;

  private lastQuery?: string;

  constructor(
    private taxonomyService: TaxonomyApi,
    private cd: ChangeDetectorRef,
    private logger: Logger,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.refreshImages();

    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(
      () => {
        this.searchQuery.imageOptions.page = 1;
        this.refreshImages();
      }
    );
  }

  ngOnDestroy() {
    if (this.subQueryUpdate) {
      this.subQueryUpdate.unsubscribe();
    }
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
  }

  pageChanged(event: any) {
    this.searchQuery.imageOptions.page = event.page;
    this.refreshImages();
  }

  refreshImages() {
    const cacheKey = JSON.stringify({
      query: this.searchQuery.query,
      imageOptions: this.searchQuery.imageOptions
    });
    if (this.lastQuery === cacheKey) {
      return;
    }
    this.lastQuery = cacheKey;

    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.loading = true;

    this.subFetch = this.fetchPage()
      .subscribe(data => {
          this.images = data.results.map(res => {
            let image: any = {};
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            for (const media of res['multimedia']!) {
              if (!media['keywords']?.includes('skeletal')) {
                image = media;
                break;
              }
            }

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

  private fetchPage(): Observable<PagedResult<Taxonomy>> {
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
        '' + this.searchQuery.imageOptions.page,
        '50',
        'taxonomic',
        {
          ...query,
          target: undefined,
          selectedFields: 'id,vernacularName,scientificName',
          hasMediaFilter: true,
          includeMedia: true
        }
      );
  }
}
