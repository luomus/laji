import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SearchQuery } from '../../+observation/search-query.model';
import { WindowRef } from '../../shared/windows-ref';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'laji-informal',
  templateUrl: './informal.component.html',
  styleUrls: ['./informal.component.css']
})
export class InformalComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('header') headerRef: ElementRef;
  @ViewChild('content') contentRef: ElementRef;

  public filtersNgStyle = {};

  private subParam: Subscription;
  private subQuery: Subscription;

  constructor(
    private route: ActivatedRoute,
    private searchQuery: SearchQuery,
    private window: WindowRef,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.subQuery = this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length === 0) {
        this.searchQuery.query = {
          finnish: true
        };
      } else {
        this.searchQuery.setQueryFromQueryObject(params);
      }

      this.searchQuery.queryUpdate({formSubmit: false, newData: true});
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
        position: 'relative',
        top: 0,
        left: 0,
        float: 'right'
      }
    } else {
      this.filtersNgStyle = {
        position: 'fixed',
        top: '50px',
        height: height + 'px'
      }
    }
  }
}
