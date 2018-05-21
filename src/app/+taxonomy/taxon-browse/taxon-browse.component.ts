import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WindowRef } from '../../shared/windows-ref';
import { Subscription } from 'rxjs/Subscription';
import { TaxonomySearchQuery } from './taxonomy-search-query.model';

@Component({
  selector: 'laji-taxon-browse',
  templateUrl: './taxon-browse.component.html',
  styleUrls: ['./taxon-browse.component.css']
})
export class TaxonBrowseComponent implements OnInit, OnDestroy {
  @ViewChild('header') headerRef: ElementRef;
  @ViewChild('content') contentRef: ElementRef;

  public type: string;

  public filtersNgStyle = {};
  public showFilter = true;

  private subData: Subscription;
  private subQuery: Subscription;

  constructor(
    private route: ActivatedRoute,
    public searchQuery: TaxonomySearchQuery,
    private window: WindowRef,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.searchQuery.empty();

    this.subQuery = this.route.queryParams.subscribe(params => {
      const changed = this.searchQuery.setQueryFromParams(params);

      if (changed) {
        this.searchQuery.queryUpdate({formSubmit: true});
        this.cd.markForCheck();

        if (!this.searchQuery.hasCorrectTargetInfo()) {
          this.searchQuery.setTargetInfo()
            .subscribe((formSubmit) => {
              this.searchQuery.queryUpdate({formSubmit: formSubmit});
              this.cd.markForCheck();
            });
        }
      }
    });
    this.subData = this.route.data.subscribe(data => {
      this.type = data['type'];
      this.cd.markForCheck();
      setTimeout(() => {
        this.setFiltersSize();
      }, 0);
    });
  }

  ngOnDestroy() {
    if (this.subData) {
      this.subData.unsubscribe();
    }
    if (this.subQuery) {
      this.subQuery.unsubscribe();
    }
  }

  informalGroupSelect(groupId) {
    this.searchQuery.query.informalTaxonGroupId = groupId;
    this.searchQuery.queryUpdate({formSubmit: true});
  }

  @HostListener('window:scroll')
  onScroll() {
    this.setFiltersSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.setFiltersSize();
  }

  private setFiltersSize() {
    const headerHeight = this.headerRef.nativeElement.offsetHeight;
    const contentHeight = this.contentRef.nativeElement.offsetHeight;
    const top = 50 + Math.max(headerHeight - this.window.nativeWindow.scrollY, 0);
    const height = contentHeight + 50 + headerHeight - top - this.window.nativeWindow.scrollY;

    if (this.window.nativeWindow.scrollY < headerHeight) {
      this.filtersNgStyle = {
        position: 'absolute',
        top: headerHeight + 'px',
        right: 0,
        height: '100%',
        'max-height': height + 'px'
      }
    } else {
      this.filtersNgStyle = {
        position: 'fixed',
        top: '50px',
        height: '100%',
        'max-height': height + 'px'
      }
    }
  }
}
