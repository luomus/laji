import {catchError, concat, take, delay, retryWhen, map, tap, switchMap} from 'rxjs/operators';
import {Observable, of, Subscription, throwError} from 'rxjs';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
  PLATFORM_ID, EventEmitter,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from '../../../shared/logger/logger.service';
import { Taxonomy, TaxonomyDescription, TaxonomyImage } from '../../../shared/model/Taxonomy';
import { TaxonomyApi } from '../../../shared/api/TaxonomyApi';
import { Title } from '@angular/platform-browser';
import { CacheService } from '../../../shared/service/cache.service';
import {WarehouseQueryInterface} from '../../../shared/model/WarehouseQueryInterface';
import {GalleryService} from '../../../shared/gallery/service/gallery.service';

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
  @Input() taxonId: string;
  @Input() context: string;
  @Input() activeTab: 'overview'|'images'|'biology'|'taxonomy'|'occurrence';

  taxon: Taxonomy;
  taxonDescription: Array<TaxonomyDescription>;
  taxonImages: Array<TaxonomyImage>;

  hasImageData: boolean;
  hasBiologyData: boolean;
  images = [];

  loading = false;
  activatedTabs = {};
  // public settings: Settings;
  private initTaxonSub: Subscription;
  private imageSub: Subscription;

  @Output() routeUpdate = new EventEmitter();

  constructor(
    public translate: TranslateService,
    private taxonService: TaxonomyApi,
    private cacheService: CacheService,
    private logger: Logger,
    private title: Title,
    private cd: ChangeDetectorRef,
    private galleryService: GalleryService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) { }

  ngOnInit() {
    this.hasImageData = this.activeTab === 'images';
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

  updateRoute(id: string, tab = this.activeTab, context = this.context) {
    this.routeUpdate.emit({id: id, tab: tab, context: context});
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

        this.hasBiologyData = !!this.taxon.primaryHabitat || !!this.taxon.secondaryHabitats || this.taxonDescription.length > 0;
        if (!this.hasBiologyData && this.activeTab === 'biology') {
          this.updateRoute(this.taxonId, 'overview');
        }

        this.setTitle();
        this.setImages();
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
      retryWhen(errors => errors.pipe(delay(1000), take(3), concat(throwError(errors)), ))).pipe(
      catchError(err => {
        this.logger.warn('Failed to fetch taxon by id', err);
        return of({});
      }));
  }

  private setImages() {
    if (this.imageSub) {
      this.imageSub.unsubscribe();
    }

    this.images = [];

    const nbrOfImages = this.taxon.species ? 1 : 9;

    const taxonImages = (this.taxonImages || []).slice(0, nbrOfImages);
    if (taxonImages.length > 0) {
      this.hasImageData = true;
    }
    let missingImages = nbrOfImages - taxonImages.length;

    let imageObs: Observable<any[]>;
    if (missingImages > 0) {
      imageObs = this.getImages(
        {
          taxonId: [this.taxon.id],
          superRecordBasis: ['HUMAN_OBSERVATION_UNSPECIFIED'],
          taxonReliability: ['RELIABLE']
        },
        missingImages
      ).pipe(
        switchMap(observationImages => {
          const images = taxonImages.concat(observationImages);
          if (images.length > 0) {
            this.hasImageData = true;
          }
          missingImages = nbrOfImages - images.length;

          if (missingImages > 0) {
            return this.getImages(
              { taxonId: [this.taxon.id], superRecordBasis: ['PRESERVED_SPECIMEN'], sourceId: ['KE.3', 'KE.167'] },
              missingImages
            ).pipe(
              map(collectionImages => images.concat(collectionImages))
            );
          } else {
            return of(images);
          }
        }));
    } else {
      imageObs = of(taxonImages);
    }

    this.imageSub = imageObs.subscribe(images => {
      this.hasImageData = images.length > 0;
      this.images = images;
      this.cd.markForCheck();

      if (!this.hasImageData && this.activeTab === 'images') {
        this.updateRoute(this.taxonId, 'overview');
      }
    });
  }

  private getImages(query: WarehouseQueryInterface, limit: number): Observable<any[]> {
    return this.galleryService.getList(
      query,
      undefined, limit, 1
    ).pipe(map(res => this.galleryService.getImages(res, limit)));
  }
}

