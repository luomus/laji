import {Component, Input, OnInit} from '@angular/core';
import {TaxonomySearchQuery} from '../service/taxonomy-search-query';
import {TaxonomyApi} from '../../../shared/api/TaxonomyApi';
import {Subscription} from 'rxjs';

@Component({
  selector: 'laji-species-count',
  templateUrl: './species-count.component.html',
  styleUrls: ['./species-count.component.scss']
})
export class SpeciesCountComponent implements OnInit {
  @Input() searchQuery: TaxonomySearchQuery;

  count: number;
  loading = false;

  private subQueryUpdate: Subscription;

  constructor(
    private taxonomyService: TaxonomyApi
  ) { }

  ngOnInit() {
    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(
      () => {
        this.updateCount();
      }
    );
    this.updateCount();
  }

  private updateCount() {
    this.loading = true;
    this.taxonomyService
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
          taxonRanks: ['MX.species']
        }
      )
      .subscribe(res => {
        this.count = res.total;
        this.loading = false;
      });
  }
}
