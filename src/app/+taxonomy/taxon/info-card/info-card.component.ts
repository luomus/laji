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
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { environment } from 'src/environments/environment';
import { Global } from 'src/environments/global';

const tabOrderProd = [ 'overview', 'images', 'biology', 'taxonomy', 'occurrence',
                   'specimens', 'endangerment', 'invasive' ];
const tabOrderDev = [ 'overview', 'images', 'identification', 'biology', 'taxonomy', 'occurrence',
                   'specimens', 'endangerment', 'invasive' ];
const basePath = '/taxon';

@Component({
  selector: 'laji-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoCardComponent implements OnInit, OnChanges, OnDestroy {
  private tabOrder = environment.type === Global.type.dev ? tabOrderDev : tabOrderProd;
  loadedTabs: LoadedElementsStore = new LoadedElementsStore(this.tabOrder);

  @Input() taxon: Taxonomy;
  @Input() isFromMasterChecklist: boolean;
  @Input() context: string;
  @Input() set activeTab(tab: 'overview'|'identification'|'images'|'biology'|'taxonomy'|'occurrence'|'observations'|'specimens'|'endangerment'|'invasive') {
    this.selectedTab = tab;
    this.loadedTabs.load(tab);
  }
  get activeTab() {
    // @ts-ignore
    return this.selectedTab;
  }

  selectedTab = 'overview'; // stores which tab index was provided by @Input

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
    const tabName = this.getTabNameFromVisibleIndex(tabIndex);
    const route = [basePath, this.taxon.id];
    if (tabName !== 'overview') { route.push(tabName); }
    this.router.navigate(
      this.localizeRouterService.translateRoute(route),
      { queryParamsHandling: 'preserve' }
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.activeTab) {
      if (this.activeTab === 'observations') {
        this.updateRoute(this.taxon.id, 'occurrence', this.context, true);
      } else if (!this.tabOrder.includes(this.activeTab)) {
        this.updateRoute(this.taxon.id, 'overview', this.context, true);
      }
    }
    if (changes.taxon) {
      this.taxonImages = (this.taxon.multimedia || []).map(img => {
        if (img['taxon']) {
          img['taxonId'] = img['taxon']['id'];
          img['vernacularName'] = img['taxon']['vernacularName'];
          img['scientificName'] = img['taxon']['scientificName'];
        }
        return img;
      });
      this.taxonDescription = (this.taxon.descriptions || []).reduce((prev, current) => {
        if (current.title) {
          prev.push(current);
        }
        return prev;
      }, []);

      // this.hasBiologyData = !!this.taxon.primaryHabitat || !!this.taxon.secondaryHabitats || this.taxonDescription.length > 0;
      this.hasBiologyData = this.taxonDescription.length > 0;
      this.isEndangered = this.getIsEndangered(this.taxon);

      if (
        (!this.hasBiologyData && this.activeTab === 'biology') ||
        (!this.isFromMasterChecklist && this.activeTab === 'specimens') ||
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
    this.selectedTab = tab;
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

  // used for translating tab indices
  private getTabConditionals(): {e, t}[] {
    return [
      {e: this.hasImageData, t: 'images'},
      {e: this.hasBiologyData, t: 'biology'},
      {e: this.isFromMasterChecklist, t: 'observations'},
      {e: this.isFromMasterChecklist, t: 'specimens'},
      {e: this.isEndangered, t: 'endangerment'},
      {e: this.taxon && this.taxon.invasiveSpecies, t: 'invasive'},
    ];
  }

  /**
   * Translates absolute tab index to visible tab index
   */
  private getVisibleTabIndex(absIdx: number): number {
    let shifted = absIdx;
    for (const c of this.getTabConditionals()) {
      if (!c.e && this.loadedTabs.getIdxFromName(c.t) < absIdx) {
        shifted--;
      }
    }
    return shifted;
  }

  /**
   * Translates tab name to visible tab index
   */
  getVisibleTabIndexFromTabName(tab: string): number {
    const loadedIdx = this.loadedTabs.getIdxFromName(tab);
    return this.getVisibleTabIndex(loadedIdx);
  }

  /**
   * Translates visible index to its tab name
   */
  private getTabNameFromVisibleIndex(visIdx: number): string {
    // this method returns tab name from the actual visible (shifted) index
    let shifted = visIdx;
    for (const c of this.getTabConditionals()) {
      if (!c.e && this.getVisibleTabIndexFromTabName(c.t) - 1 < visIdx) {
        shifted++;
      }
    }
    return this.loadedTabs.getNameFromIdx(shifted);
  }
}
