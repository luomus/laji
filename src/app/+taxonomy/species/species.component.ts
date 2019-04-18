import { WINDOW } from '@ng-toolkit/universal';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { TaxonomySearchQuery } from './service/taxonomy-search-query';
import { FooterService } from '../../shared/service/footer.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'laji-taxon-browse',
  templateUrl: './species.component.html',
  styleUrls: ['./species.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesComponent implements OnInit, OnDestroy {
  @ViewChild('header') headerRef: ElementRef;

  public active: string;
  public activated = {};

  public stickyFilter = false;
  public showFilter = true;

  private subParams: Subscription;
  private subQueryUpdate: Subscription;

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

    this.subParams = this.route.params.pipe(
      map(data => data['tab']),
    )
      .subscribe(tab => {
        this.active = tab;
        this.activated[tab] = true;
        this.cd.markForCheck();
      });
    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(
      () => {
        this.activated = {[this.active]: true};
        this.cd.markForCheck();
      }
    );

    this.searchQuery.setQueryFromParams(this.route.snapshot.queryParams);
    this.setFilterPosition();
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;

    if (this.subParams) {
      this.subParams.unsubscribe();
    }
    if (this.subQueryUpdate) {
      this.subQueryUpdate.unsubscribe();
    }
  }

  @HostListener('window:popstate')
  onPopState() {
    // Route snapshot is not populated with the latest info when this event is triggered. So we need to delay the execution little.
    setTimeout(() => {
      this.searchQuery.setQueryFromParams(this.route.snapshot.queryParams);
      this.cd.markForCheck();
    });
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
