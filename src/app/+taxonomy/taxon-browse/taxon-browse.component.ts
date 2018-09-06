import { WINDOW } from '@ng-toolkit/universal';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import { TaxonomySearchQuery } from './service/taxonomy-search-query';
import { TaxonomyColumns } from './service/taxonomy-columns';
import { FooterService } from '../../shared/service/footer.service';
import { isPlatformBrowser } from '@angular/common';
import { TaxonTreeComponent } from './taxon-tree/taxon-tree.component';

@Component({
  selector: 'laji-taxon-browse',
  templateUrl: './taxon-browse.component.html',
  styleUrls: ['./taxon-browse.component.css']
})
export class TaxonBrowseComponent implements OnInit, OnDestroy {
  @ViewChild('header') headerRef: ElementRef;

  public active: string;
  public activated = {};

  public stickyFilter = false;
  public showFilter = true;

  private subData: Subscription;
  private subQuery: Subscription;

  constructor(
    @Inject(WINDOW) private window: Window,
    @Inject(PLATFORM_ID) private platformID: object,
    private route: ActivatedRoute,
    public searchQuery: TaxonomySearchQuery,
    public columnService: TaxonomyColumns,
    private cd: ChangeDetectorRef,
    private footerService: FooterService
  ) { }

  ngOnInit() {
    this.footerService.footerVisible = false;

    this.subQuery = this.route.params.pipe(
      map(data => data['tab']),
      withLatestFrom(this.route.queryParams)
    )
      .subscribe(([tab, params]) => {
        if (tab === 'tree') {
          this.searchQuery.skippedQueryParams = [
            'informalGroupFilters',
            'target',
            'invasiveSpeciesFilter',
            'redListStatusFilters',
            'adminStatusFilters',
            'typesOfOccurrenceFilters',
            'typesOfOccurrenceNotFilters'
          ];
        } else {
          this.searchQuery.skippedQueryParams = [];
        }

        if (params['reset']) {
          this.searchQuery.empty();
          TaxonTreeComponent.emptyCache();
        }
        this.searchQuery.setQueryFromParams(params);
        this.searchQuery.queryUpdate();

        this.active = tab;
        this.activated[tab] = true;
        this.cd.markForCheck();
      });

    this.setFilterPosition();
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;
    if (this.subData) {
      this.subData.unsubscribe();
    }
    if (this.subQuery) {
      this.subQuery.unsubscribe();
    }
  }

  informalGroupSelect(groupId?) {
    this.searchQuery.query.informalGroupFilters = groupId;
    this.searchQuery.queryUpdate({formSubmit: true});
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onResize() {
    this.setFilterPosition();
  }

  private setFilterPosition() {
    if (isPlatformBrowser(this.platformID)) {
      const headerHeight = this.headerRef.nativeElement.offsetHeight;
      this.stickyFilter = !(this.window.scrollY < headerHeight);
    }
  }
}
