import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { TaxonomySearch } from '../service/taxonomy-search.service';
import { Subscription } from 'rxjs';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

@Component({
  selector: 'laji-species-count',
  templateUrl: './species-count.component.html',
  styleUrls: ['./species-count.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesCountComponent implements OnInit, OnDestroy {
  @Input({ required: true }) search!: TaxonomySearch;
  @Input() hasMediaFilter?: boolean;

  count?: number;
  loading = false;

  private subFetch?: Subscription;
  private subQueryUpdate?: Subscription;
  private lastQuery?: string;

  constructor(
    private cd: ChangeDetectorRef,
    private api: LajiApiClientBService
  ) { }

  ngOnInit() {
    this.subQueryUpdate = this.search.searchUpdated$.subscribe(
      () => {
        this.updateCount();
      }
    );
    this.updateCount();
  }

  ngOnDestroy() {
    if (this.subQueryUpdate) {
      this.subQueryUpdate.unsubscribe();
    }
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
  }

  private updateCount() {
    const cacheKey = JSON.stringify({
      taxonId: this.search.taxonId,
      query: this.search.query,
      filters: this.search.filters,
      hasMediaFilter: this.hasMediaFilter
    });
    if (this.lastQuery === cacheKey) {
      return;
    }
    this.lastQuery = cacheKey;

    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }

    if (this.search.filters.taxonRank && this.search.filters.taxonRank.indexOf('MX.species') === -1) {
      this.count = 0;
      this.loading = false;
      this.cd.markForCheck();
      return;
    }

    this.loading = true;
    this.subFetch = this.api.post('/taxa/{id}/species', {
      path: { id: this.search.taxonId || 'MX.37600' },
      query: { ...this.search.query, page: 1, pageSize: 0 }
    }, {
      ...this.search.filters,
      hasMultimedia: this.hasMediaFilter
    }).subscribe(res => {
        this.count = res.total;
        this.loading = false;
        this.cd.markForCheck();
      });
  }
}
