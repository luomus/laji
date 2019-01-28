import {catchError, concat, take, delay, retryWhen, map, tap} from 'rxjs/operators';
import { Observable, of as ObservableOf, throwError as observableThrowError } from 'rxjs';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  Output,
  EventEmitter,
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
import { ObservationMapComponent } from '../../../shared-modules/observation-map/observation-map/observation-map.component';
import { Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { CacheService } from '../../../shared/service/cache.service';

const CACHE_KEY = 'info-card-boxes';
interface Settings { [key: string]: {open: boolean}; }

@Component({
  selector: 'laji-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoCardComponent implements OnInit, OnChanges {
  private static settings: Settings;

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
  @Input() public context: string;
  @Output() descriptionChange = new EventEmitter<string>();
  public settings: Settings;

  constructor(
    public translate: TranslateService,
    private taxonService: TaxonomyApi,
    private cacheService: CacheService,
    private logger: Logger,
    private title: Title,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: object,
  ) { }

  ngOnInit() {
    this.initSettings();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxonId) {
      this.taxonDescription = [];
      this.taxonImages = [];
      this.activeImage = 1;
      this.initTaxon().subscribe(() => {
        this.cd.markForCheck();
      });
    }
  }

  private initSettings() {
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

