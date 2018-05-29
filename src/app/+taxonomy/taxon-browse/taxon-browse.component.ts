import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WindowRef } from '../../shared/windows-ref';
import { Subscription } from 'rxjs/Subscription';
import { TaxonomySearchQuery } from './taxonomy-search-query.model';
import { FooterService } from '../../shared/service/footer.service';

@Component({
  selector: 'laji-taxon-browse',
  templateUrl: './taxon-browse.component.html',
  styleUrls: ['./taxon-browse.component.css']
})
export class TaxonBrowseComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('header') headerRef: ElementRef;

  public type: string;

  public filtersNgStyle = {};
  public showFilter = true;

  private subData: Subscription;
  private subQuery: Subscription;

  constructor(
    private route: ActivatedRoute,
    public searchQuery: TaxonomySearchQuery,
    private window: WindowRef,
    private cd: ChangeDetectorRef,
    private footerService: FooterService
  ) { }

  ngOnInit() {
    this.footerService.footerVisible = false;
    this.searchQuery.empty();

    this.subQuery = this.route.queryParams.subscribe(params => {
      const changed = this.searchQuery.setQueryFromParams(params);

      if (changed) {
        this.searchQuery.queryUpdate({formSubmit: true});
        this.cd.markForCheck();
      }
    });
    this.subData = this.route.data.subscribe(data => {
      this.type = data['type'];
      this.setFiltersSize();
      this.cd.markForCheck();
    });
  }

  ngAfterViewInit() {
    this.setFiltersSize();
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
    this.setFiltersSize();
  }

  private setFiltersSize() {
    const headerHeight = this.headerRef.nativeElement.offsetHeight;

    if (this.window.nativeWindow.scrollY < headerHeight) {
      this.filtersNgStyle = {
        position: 'absolute',
        top: headerHeight + 'px',
        right: 0,
        height: 'calc(100% - ' + headerHeight + 'px)'
      }
    } else {
      this.filtersNgStyle = {
        position: 'fixed',
        top: '50px',
        height: '100%'
      }
    }
  }
}
