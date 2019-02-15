import {catchError, concat, take, delay, retryWhen, map, tap} from 'rxjs/operators';
import {Observable, of as ObservableOf, Subscription, throwError as observableThrowError} from 'rxjs';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '../../../shared/logger/logger.service';
import { Taxonomy, TaxonomyDescription, TaxonomyImage } from '../../../shared/model/Taxonomy';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { CacheService } from '../../../shared/service/cache.service';
import {Router} from '@angular/router';
import {LocalizeRouterService} from '../../../locale/localize-router.service';

// const CACHE_KEY = 'info-card-boxes';
// interface Settings { [key: string]: {open: boolean}; }

@Component({
  selector: 'laji-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoCardComponent implements OnInit, OnChanges {
  // private static settings: Settings;

  taxon: Taxonomy;
  taxonDescription: Array<TaxonomyDescription>;
  taxonImages: Array<TaxonomyImage>;

  loading = false;

  @Input() public taxonId: string;
  @Input() public context: string;

  activeTab: 'overview'|'images' = 'overview';
  activatedTabs = {'overview': true};
  // public settings: Settings;
  initTaxonSub: Subscription;

  constructor(
    public translate: TranslateService,
    private taxonService: TaxonomyApi,
    private cacheService: CacheService,
    private logger: Logger,
    private title: Title,
    private cd: ChangeDetectorRef,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) { }

  ngOnInit() {
    // this.initSettings();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxonId) {
      if (this.initTaxonSub) {
        this.initTaxonSub.unsubscribe();
      }

      this.loading = true;
      this.initTaxonSub = this.initTaxon().subscribe(() => {
        this.loading = false;
        this.cd.markForCheck();
      });
    }

    if (changes.activeTab) {
      this.activatedTabs[this.activeTab] = true;
    }
  }

  setActiveTab(tab: 'overview'|'images') {
    this.activeTab = tab;
    this.activatedTabs[this.activeTab] = true;
  }

  onTaxonSelect(id: string) {
    this.router.navigate(
      this.localizeRouterService.translateRoute(
        ['/taxon', id]
      )
    );
  }

/*  private initSettings() {
    const settings$ = InfoCardComponent.settings ?
      ObservableOf(InfoCardComponent.settings) :
      this.cacheService.getItem<Settings>(CACHE_KEY)
        .pipe(
          map(value => value || {}),
          tap(value => InfoCardComponent.settings = value)
        );

    settings$.subscribe(settings => {
      this.settings = settings;
      this.cd.markForCheck();
    });
  }

  updateSettings(boxName: string, open: boolean) {
    this.settings[boxName] = {open: open};
    InfoCardComponent.settings[boxName] = {open: open};
    this.cacheService.setItem<Settings>(CACHE_KEY, InfoCardComponent.settings)
      .subscribe(() => {}, () => {});
  }
*/

 /* private updateMap() {
    if (!this.map || !isPlatformBrowser(this.platformId)) {
      return;
    }
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        this.cd.markForCheck();
      }
    }, 100);
  }*/

  private initTaxon(): Observable<any> {
    return this.getTaxon(this.taxonId).pipe(
      tap(taxon => {
        this.taxon = taxon;
        this.taxonImages = (taxon.multimedia || []).map(img => {
          if (img.taxon) {
            img = {...img.taxon, ...img};
          }
          return img;
        });
        this.taxonDescription = (taxon.descriptions || []).reduce((prev, current) => {
          if (current.title) {
            prev.push(current);
          }
          return prev;
        }, []);

        this.setTitle();
        // this.updateMap();
      })
    );
  }

  private setTitle() {
    let title = this.taxon.vernacularName && this.taxon.vernacularName[this.translate.currentLang] || '';
    title += title ? ' (' + this.taxon.scientificName + ')' : this.taxon.scientificName;
    this.title.setTitle((title ? title + ' | '  : '') + this.title.getTitle());
  }

  private getTaxon(id) {
    return this.taxonService
      .taxonomyFindBySubject(id, 'multi', {includeMedia: true, includeDescriptions: true}).pipe(
      retryWhen(errors => errors.pipe(delay(1000), take(3), concat(observableThrowError(errors)), ))).pipe(
      catchError(err => {
        this.logger.warn('Failed to fetch taxon by id', err);
        return ObservableOf({});
      }));
  }
}

