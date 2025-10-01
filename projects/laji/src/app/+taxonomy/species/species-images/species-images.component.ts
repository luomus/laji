import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TaxonomySearch } from '../service/taxonomy-search.service';
import { Logger } from '../../../shared/logger/logger.service';
import { Subscription } from 'rxjs';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

@Component({
  selector: 'laji-species-images',
  templateUrl: './species-images.component.html',
  styleUrls: ['./species-images.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesImagesComponent implements OnInit, OnDestroy {
  @Input({ required: true }) search!: TaxonomySearch;
  @Input() showSpeciesTotalCount = false;
  @Input() countStartText = '';
  @Input() countEndText = '';
  loading = false;

  images: any[] = [];
  pageSize = 50;
  total = 0;

  private subFetch?: Subscription;
  private subQueryUpdate?: Subscription;

  constructor(
    private cd: ChangeDetectorRef,
    private logger: Logger,
    private api: LajiApiClientBService
  ) {}

  ngOnInit() {
    this.refreshImages();

    this.subQueryUpdate = this.search.queryUpdated$.subscribe(
      () => {
        this.search.imageOptions.page = 1;
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
    this.search.imageOptions.page = event.page;
    this.refreshImages();
  }

  refreshImages() {
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

  private fetchPage() {
    const { taxonId, query: _query, filters: _filters } = this.search;
    const query = {
      ..._query,
      selectedFields: 'id,vernacularName,scientificName,multimedia',
      includeMedia: true,
      page: this.search.imageOptions.page,
      pageSize: 50,
      checklist: 'MR.1,MR.2'
    };
    const filters = {
      ..._filters,
      hasMultimedia: true
    };
    return this.api.post('/taxa/{id}/species', { path: { id: taxonId || 'MX.37600' }, query }, filters);
  }
}
