import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaxonomySearchQuery } from '../species/service/taxonomy-search-query';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-browse-species',
  templateUrl: './browse-species.component.html',
  styleUrls: ['./browse-species.component.scss']
})
export class BrowseSpeciesComponent implements OnInit, OnDestroy {
  active = 'images';
  activated = {'images': true};

  private subQuery: Subscription;

  constructor(
    public searchQuery: TaxonomySearchQuery,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.searchQuery.setQueryFromParams({...this.route.snapshot.queryParams, onlyFinnish: 'true'});
  }

  ngOnDestroy() {
    if (this.subQuery) {
      this.subQuery.unsubscribe();
    }
  }

  informalGroupChange(id: string) {
    this.searchQuery.query.informalGroupFilters = id;
    this.searchQuery.updateUrl(['onlyFinnish']);
  }

  @HostListener('window:popstate')
  onPopState() {
    // Route snapshot is not populated with the latest info when this event is triggered. So we need to delay the execution little.
    setTimeout(() => {
      this.searchQuery.setQueryFromParams({...this.route.snapshot.queryParams, onlyFinnish: 'true'});
      this.cd.markForCheck();
    });
  }

  setActive(tab: string) {
    this.active = tab;
    this.activated[tab] = true;
  }
}
