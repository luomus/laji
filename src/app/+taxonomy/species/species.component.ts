import { WINDOW } from '@ng-toolkit/universal';
import { ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { map, withLatestFrom } from 'rxjs/operators';
import { TaxonomySearchQuery } from './service/taxonomy-search-query';
import { FooterService } from '../../shared/service/footer.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'laji-taxon-browse',
  templateUrl: './species.component.html',
  styleUrls: ['./species.component.css']
})
export class SpeciesComponent implements OnInit, OnDestroy {
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
        if (params['reset']) {
          this.searchQuery.empty();
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
