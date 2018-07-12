import { WINDOW } from '@ng-toolkit/universal';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, HostListener , Inject} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { withLatestFrom, map } from 'rxjs/operators';
import { TaxonomySearchQuery } from './taxonomy-search-query.model';
import { TaxonomyColumns } from './taxonomy-columns.model';
import { FooterService } from '../../shared/service/footer.service';

@Component({
  selector: 'laji-taxon-browse',
  templateUrl: './taxon-browse.component.html',
  styleUrls: ['./taxon-browse.component.css']
})
export class TaxonBrowseComponent implements OnInit, OnDestroy {
  @ViewChild('header') headerRef: ElementRef;

  public type: string;

  public stickyFilter = false;
  public showFilter = true;

  private subData: Subscription;
  private subQuery: Subscription;

  constructor(
    @Inject(WINDOW) private window: Window,
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
      .subscribe(([type, params]) => {
        if (type === 'tree') {
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
        }
        this.searchQuery.setQueryFromParams(params);
        this.searchQuery.queryUpdate();

        this.type = type;
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

  informalGroupSelect(groupId) {
    this.searchQuery.query.informalGroupFilters = groupId;
    this.searchQuery.queryUpdate({formSubmit: true});
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onResize() {
    this.setFilterPosition();
  }

  private setFilterPosition() {
    const headerHeight = this.headerRef.nativeElement.offsetHeight;
    this.stickyFilter = !(this.window.scrollY < headerHeight);
  }
}
