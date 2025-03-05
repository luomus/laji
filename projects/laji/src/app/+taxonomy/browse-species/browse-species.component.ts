import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaxonomySearchQuery } from '../species/service/taxonomy-search-query';
import { Subscription } from 'rxjs';
import { LoadedElementsStore } from '../../../../../laji-ui/src/lib/tabs/tab-utils';

@Component({
  selector: 'laji-browse-species',
  templateUrl: './browse-species.component.html',
  styleUrls: ['./browse-species.component.scss']
})
export class BrowseSpeciesComponent implements OnInit, OnDestroy {
  activeIndex = 0;
  loadedTabs = new LoadedElementsStore(['images', 'list']);

  private subQueryUpdate?: Subscription;
  private queryParamsSubscription?: Subscription;

  constructor(
    public searchQuery: TaxonomySearchQuery,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadedTabs.load(this.activeIndex);
    this.searchQuery.setQueryFromParams({...this.route.snapshot.queryParams, onlyFinnish: 'true'});

    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      this.searchQuery.query.informalGroupFilters = params.informalGroupFilters;
      this.searchQuery.updateUrl(['onlyFinnish']);
    });
  }

  ngOnDestroy() {
    if (this.subQueryUpdate) {
      this.subQueryUpdate.unsubscribe();
    }
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  @HostListener('window:popstate')
  onPopState() {
    // Route snapshot is not populated with the latest info when this event is triggered. So we need to delay the execution little.
    setTimeout(() => {
      this.searchQuery.setQueryFromParams({...this.route.snapshot.queryParams, onlyFinnish: 'true'});
      this.cd.markForCheck();
    });
  }

  setActive(tabIdx: number) {
    this.activeIndex = tabIdx;
    this.loadedTabs.load(tabIdx);
  }
}
