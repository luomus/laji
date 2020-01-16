import { map, switchMap, tap } from 'rxjs/operators';
import { Observable, of, Subscription } from 'rxjs';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { Taxonomy, TaxonomyDescription } from '../../../shared/model/Taxonomy';
import { GalleryService } from '../../../shared/gallery/service/gallery.service';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { Image } from '../../../shared/gallery/image-gallery/image.interface';
import { InfoCardQueryService } from './shared/service/info-card-query.service';
import { LoadedElementsStore } from '../../../../../projects/laji-ui/src/lib/tabs/tab-utils';
import { LocalizeRouterService } from 'app/locale/localize-router.service';
import { Router } from '@angular/router';

const tabOrder = [ 'overview', 'images', 'biology', 'taxonomy', 'occurrence',
                   'observations', 'specimens', 'endangerment', 'invasive' ];
const basePath = '/taxon';

@Component({
  selector: 'laji-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoCardComponent implements OnInit, OnChanges, OnDestroy {
  loadedTabs: LoadedElementsStore = new LoadedElementsStore(tabOrder);

  @Input() taxon: Taxonomy;
  @Input() isFromMasterChecklist: boolean;
  @Input() context: string;
  @Input() set activeTab(tab: 'overview'|'images'|'biology'|'taxonomy'|'occurrence'|'observations'|'specimens'|'endangerment'|'invasive') {
    this.selectedTabIdx = this.loadedTabs.getIdxFromName(tab);
    this.loadedTabs.load(tab);
  }
  get activeTab() {
    // @ts-ignore
    return this.loadedTabs.getNameFromIdx(this.selectedTabIdx);
  }

  selectedTabIdx = 0; // stores which tab index was provided by @Input

  taxonDescription: Array<TaxonomyDescription>;
  taxonImages: Array<Image>;

  hasImageData: boolean;
  hasBiologyData: boolean;
  isEndangered: boolean;
  images = [];

  sub: Subscription;

  private imageSub: Subscription;

  @Output() routeUpdate = new EventEmitter();

  constructor(
    private cd: ChangeDetectorRef,
    private galleryService: GalleryService,
    private localizeRouterService: LocalizeRouterService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.hasImageData === undefined) {
      this.hasImageData = this.activeTab === 'images';
    }
  }

  onSelect(tabIndex) {
    const tabName = this.loadedTabs.getNameFromIdx(tabIndex);
    const route = [basePath, this.taxon.id];
    if (tabName !== 'overview') { route.push(tabName); }
    this.router.navigate(
      this.localizeRouterService.translateRoute(route),
      { preserveQueryParams: true }
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.taxon) {
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

  private getTabIndex(tab: string) {
    // There's a varying number of tabs relative to hasBiologyData, hasImageData etc.
    // this.loadedTabs stores all of the tabs regardless if they are loaded in or not
    const loadedIdx = this.loadedTabs.getIdxFromName(tab);
    let idx = loadedIdx;
    const biologyIdx = this.loadedTabs.getIdxFromName('biology')
    const imageIdx = this.loadedTabs.getIdxFromName('images')
    const observationsIdx = this.loadedTabs.getIdxFromName('observations')
    if (!this.hasBiologyData && biologyIdx < loadedIdx) {
      idx--;
    }
    if (!this.hasImageData && imageIdx < loadedIdx) {
      idx--;
    }
    if (!this.isFromMasterChecklist && observationsIdx < loadedIdx) {
      idx--;
    }
    const conditionals = [
      {enabled: this.hasBiologyData, tabName: 'biology'}
    ]
    for (const c in conditionals) {
      if (!c.enabled && this.loadedTabs.getIdxFromName(c.tabName) < loadedIdx) {
        idx--;
      }
    }
  }
}
