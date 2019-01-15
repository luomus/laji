
import {catchError, concat, take, delay, retryWhen, combineLatest, map, switchMap, tap, share} from 'rxjs/operators';
import { Observable, of as ObservableOf, Subscription, throwError as observableThrowError } from 'rxjs';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Logger } from '../../../shared/logger/logger.service';
import { Taxonomy, TaxonomyDescription, TaxonomyImage } from '../../../shared/model/Taxonomy';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { ObservationMapComponent } from '../../../shared-modules/observation-map/observation-map/observation-map.component';
import { Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { CacheService } from '../../../shared/service/cache.service';

const CACHE_KEY = 'info-card-boxes';

@Component({
  selector: 'laji-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoCardComponent implements OnInit, OnDestroy {
  private static settings: any;

  @ViewChild(ObservationMapComponent) map: ObservationMapComponent;

  public taxon: Taxonomy;
  public taxonDescription: Array<TaxonomyDescription>;
  public taxonImages: Array<TaxonomyImage>;
  public taxonConceptId: string;
  public activePanel = 0;
  public activeImage = 1;
  public activeImageTab: string;
  public hasCollectionImages = false;
  public hasTaxonImages = true;
  public hasDescription = true;
  public loading = false;

  @Input() public taxonId: string;
  public context: string;
  public settings: any;

  private subParam: Subscription;

  constructor(
    public translate: TranslateService,
    private taxonService: TaxonomyApi,
    private cacheService: CacheService,
    private route: ActivatedRoute,
    private logger: Logger,
    private router: Router,
    private title: Title,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: object,
  ) { }

  ngOnInit() {
    this.taxonDescription = [];
    this.taxonImages = [];
    if (!this.taxonId) {
      this.subParam = this.route.params.pipe(
        combineLatest(this.route.queryParams),
        map(data => {
          this.taxonId = data[0]['id'];
          this.context = data[0]['context'] || data[1]['context'] || 'default';
          this.activeImage = 1;
          return {...data[1], ...data[0]};
        }),
        switchMap(() => this.initTaxon())
      )
        .subscribe(() => {
          this.cd.markForCheck();
        });
    }

    this.initSettings();
  }

  private initSettings() {
    const settings$ = InfoCardComponent.settings ?
      ObservableOf(InfoCardComponent.settings) :
      this.cacheService.getItem<any>(CACHE_KEY)
        .pipe(
          map(value => value || {}),
          tap(value => InfoCardComponent.settings = value)
        );

    settings$.subscribe(settings => {
      this.settings = settings;
    });
  }

  updateSettings(boxName: string, open: boolean) {
    this.settings[boxName] = {open: open};
    InfoCardComponent.settings[boxName] = {open: open};
    this.cacheService.setItem<Settings>(CACHE_KEY, InfoCardComponent.settings)
      .subscribe(() => {}, () => {});
  }

  onCollectionImagesLoaded(event) {
    this.hasCollectionImages = event;
    this.updateMap();
  }

  setActive(event) {
    this.activePanel = this.activePanel === event.value ? null : event.value;
  }

  setActiveImageTab(tab: string) {
    this.activeImageTab = tab;
  }

  ngOnDestroy() {
    if (this.subParam) {
      this.subParam.unsubscribe();
    }
  }

  onDescriptionChange(context: string) {
    this.router.navigate([], {
      queryParams: (context === 'default' ? {} : {context: context}),
      replaceUrl: true
    });
  }

  get isFromMasterChecklist() {
    const masterChecklist = 'MR.1';
    if (!this.taxon) {
      return false;
    }
    if (this.taxon.checklist) {
      return this.taxon.checklist.indexOf(masterChecklist) > -1;
    }
    return this.taxon.nameAccordingTo === masterChecklist;
  }

  private updateMap() {
    if (!this.map || !isPlatformBrowser(this.platformId)) {
      return;
    }
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        this.cd.markForCheck();
      }
    }, 100);
  }

  private initTaxon(): Observable<any> {
    this.loading = true;
    return this.getTaxon(this.taxonId).pipe(
      tap(taxon => {
        this.loading = false;
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
        this.hasDescription = this.taxonDescription.length > 0;
        this.hasTaxonImages = this.taxonImages.length > 0;
        this.activeImageTab = this.hasTaxonImages ? 'taxon' : 'collection';
        this.hasCollectionImages = false;
        (this.taxon.additionalIds || []).map(id => {
          const parts = id.split(':');
          if (parts[0] === 'taxonid') {
            this.taxonConceptId = parts[1];
          }
        });
        this.setTitle();
        this.updateMap();
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

