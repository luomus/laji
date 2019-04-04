import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {TaxonomySearchQuery} from '../service/taxonomy-search-query';
import {TaxonomyApi} from '../../../shared/api/TaxonomyApi';
import {Subscription} from 'rxjs';

@Component({
  selector: 'laji-species-count',
  templateUrl: './species-count.component.html',
  styleUrls: ['./species-count.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesCountComponent implements OnInit, OnDestroy {
  @Input() searchQuery: TaxonomySearchQuery;
  @Input() hasMediaFilter: boolean;

  count: number;
  loading = false;

  private subFetch: Subscription;
  private subQueryUpdate: Subscription;
  private lastQuery: string;

  constructor(
    private taxonomyService: TaxonomyApi,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(
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
      query: this.searchQuery.query,
      hasMediaFilter: this.hasMediaFilter
    });
    if (this.lastQuery === cacheKey) {
      return;
    }
    this.lastQuery = cacheKey;

    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }

    if (this.searchQuery.query.taxonRanks && this.searchQuery.query.taxonRanks.indexOf('MX.species') === -1) {
      this.count = 0;
      this.loading = false;
      return;
    }

    this.loading = true;
    this.subFetch = this.taxonomyService
      .taxonomyFindSpecies(
        this.searchQuery.query.target ? this.searchQuery.query.target : 'MX.37600',
        'multi',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        '1',
        '0',
        undefined,
        {
          ...this.searchQuery.query,
          target: undefined,
          taxonRanks: ['MX.species'],
          hasMediaFilter: this.hasMediaFilter
        }
      )
      .subscribe(res => {
        this.count = res.total;
        this.loading = false;
        this.cd.markForCheck();
      });
  }
}
