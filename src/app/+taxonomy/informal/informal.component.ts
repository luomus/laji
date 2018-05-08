import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WindowRef } from '../../shared/windows-ref';
import { Subscription } from 'rxjs/Subscription';
import { TaxonomySearchQuery } from '../taxonomy-search-query.model';

@Component({
  selector: 'laji-informal',
  templateUrl: './informal.component.html',
  styleUrls: ['./informal.component.css']
})
export class InformalComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('header') headerRef: ElementRef;
  @ViewChild('content') contentRef: ElementRef;

  public filtersNgStyle = {};
  public showFilter = true;

  private subParam: Subscription;
  private subQuery: Subscription;

  constructor(
    private route: ActivatedRoute,
    public searchQuery: TaxonomySearchQuery,
    private window: WindowRef,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.subQuery = this.route.queryParams.subscribe(params => {
      this.searchQuery.setQueryFromParams(params);
      this.searchQuery.queryUpdate({formSubmit: false});
      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this.subParam) {
      this.subParam.unsubscribe();
    }
    if (this.subQuery) {
      this.subQuery.unsubscribe();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setFiltersSize();
    }, 0);
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
