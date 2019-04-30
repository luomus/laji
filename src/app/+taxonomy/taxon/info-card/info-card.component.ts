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
  PLATFORM_ID, EventEmitter, OnDestroy, HostListener
} from '@angular/core';
import { Taxonomy, TaxonomyDescription } from '../../../shared/model/Taxonomy';
import {GalleryService} from '../../../shared/gallery/service/gallery.service';
import {WarehouseQueryInterface} from '../../../shared/model/WarehouseQueryInterface';
import {Image} from '../../../shared/gallery/image-gallery/image.interface';
import {InfoCardQueryService} from './shared/service/info-card-query.service';

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
  @Input() activeTab: 'overview'|'images'|'biology'|'taxonomy'|'occurrence'|'observations'|'specimens'|'endangerment'|'invasive';

  taxonDescription: Array<TaxonomyDescription>;
  taxonImages: Array<Image>;

  hasImageData: boolean;
  hasBiologyData: boolean;
  isEndangered: boolean;
  showMenu = false;
  images = [];

  activatedTabs = {};

  screenWidth: any;

  private imageSub: Subscription;

  @Output() routeUpdate = new EventEmitter();

  constructor(
    private cd: ChangeDetectorRef,
    private galleryService: GalleryService,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;

    if (this.screenWidth > 767) {
      this.showMenu = true;
    } else {
      this.showMenu = false;
    }

    console.log(this.screenWidth);
  }



  ngOnInit() {
    if (window.innerWidth > 767) {
      this.showMenu = true;
      this.screenWidth = window.innerWidth;
    } else {
      this.showMenu = false;
      this.screenWidth = window.innerWidth;
    }

    if (this.hasImageData === undefined) {
      this.hasImageData = this.activeTab === 'images';
    }
  }



  ngOnChanges(changes: SimpleChanges) {
    if (changes.activeTab) {
      this.activatedTabs[this.activeTab] = true;
      this.showMenu = false;
    }

    if (changes.taxon) {
      this.activatedTabs = {[this.activeTab]: true};

      this.taxonImages = (this.taxon.multimedia || []).map(img => {
        if (img['taxon']) {
          img['taxonId'] = img['taxon']['id'];
          img['vernacularName'] = img['taxon']['vernacularName'];
          img['scientificName'] = img['taxon']['scientificName'];
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
      this.isEndangered = this.getIsEndangered(this.taxon);

      if (
        (!this.hasBiologyData && this.activeTab === 'biology') ||
        (!this.isFromMasterChecklist && (this.activeTab === 'observations' || this.activeTab === 'specimens')) ||
        (!this.isEndangered && this.activeTab === 'endangerment') ||
        (!this.taxon.invasiveSpecies && this.activeTab === 'invasive')
      ) {
        this.updateRoute(this.taxon.id, 'overview', this.context, true);
      }

      this.setImages();

    }
  }

  ngOnDestroy() {
    if (this.imageSub) {
      this.imageSub.unsubscribe();
    }
  }

  updateRoute(id: string, tab = this.activeTab, context = this.context, replaceUrl = false) {
    this.routeUpdate.emit({id: id, tab: tab, context: context, replaceUrl: replaceUrl});
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
    if (missingImages > 0 && this.isFromMasterChecklist) {
      imageObs = this.getImages(
        InfoCardQueryService.getReliableHumanObservationQuery(this.taxon.id),
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
              InfoCardQueryService.getSpecimenQuery(this.taxon.id),
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
        this.updateRoute(this.taxon.id, 'overview', this.context, true);
      }
    });
  }

  private getImages(query: WarehouseQueryInterface, limit: number): Observable<any[]> {
    return this.galleryService.getList(
      query,
      undefined, limit, 1
    ).pipe(map(res => this.galleryService.getImages(res, limit)));
  }

  private getIsEndangered(taxon: Taxonomy): boolean {
    if (!taxon.latestRedListStatusFinland) {
      return false;
    }

    const status = taxon.latestRedListStatusFinland.status;

    for (const type of ['EX', 'EW', 'RE', 'CR', 'EN', 'VU', 'NT', 'DD']) {
      if (status === 'MX.iucn' + type) {
        return true;
      }
    }

    return false;
  }


  toggleMenuMobile() {
    this.showMenu = !this.showMenu;
  }
}
