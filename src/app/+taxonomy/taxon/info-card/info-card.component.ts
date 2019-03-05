import { map, switchMap } from 'rxjs/operators';
import {Observable, of, Subscription} from 'rxjs';
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
  PLATFORM_ID, EventEmitter, OnDestroy,
} from '@angular/core';
import { Taxonomy, TaxonomyDescription, TaxonomyImage } from '../../../shared/model/Taxonomy';
import {GalleryService} from '../../../shared/gallery/service/gallery.service';
import {WarehouseQueryInterface} from '../../../shared/model/WarehouseQueryInterface';


@Component({
  selector: 'laji-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoCardComponent implements OnInit, OnChanges, OnDestroy {
  @Input() taxon: Taxonomy;
  @Input() isFromMasterChecklist: boolean;
  @Input() context: string;
  @Input() activeTab: 'overview'|'images'|'biology'|'taxonomy'|'occurrence';

  taxonDescription: Array<TaxonomyDescription>;
  taxonImages: Array<TaxonomyImage>;

  hasImageData: boolean;
  hasBiologyData: boolean;
  images = [];

  activatedTabs = {};

  private imageSub: Subscription;

  @Output() routeUpdate = new EventEmitter();

  constructor(
    private cd: ChangeDetectorRef,
    private galleryService: GalleryService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) { }

  ngOnInit() {
    if (this.hasImageData === undefined) {
      this.hasImageData = this.activeTab === 'images';
    }
    if (this.hasBiologyData === undefined) {
      this.hasBiologyData = this.activeTab === 'biology';
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.activeTab) {
      this.activatedTabs[this.activeTab] = true;
    }

    if (changes.taxon) {
      this.taxonImages = (this.taxon.multimedia || []).map(img => {
        if (img['taxon']) {
          img = {...img['taxon'], ...img};
        }
        return img;
      });
      this.taxonDescription = (this.taxon.descriptions || []).reduce((prev, current) => {
        if (current.title) {
          prev.push(current);
        }
        return prev;
      }, []);

      this.hasBiologyData = !!this.taxon.primaryHabitat || !!this.taxon.secondaryHabitats || this.taxonDescription.length > 0;
      if (!this.hasBiologyData && this.activeTab === 'biology') {
        this.updateRoute(this.taxon.id, 'overview');
      }

      this.setImages();
    }
  }

  ngOnDestroy() {
    if (this.imageSub) {
      this.imageSub.unsubscribe();
    }
  }

  updateRoute(id: string, tab = this.activeTab, context = this.context) {
    this.routeUpdate.emit({id: id, tab: tab, context: context});
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
            this.cd.markForCheck();
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
        this.updateRoute(this.taxon.id, 'overview');
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
