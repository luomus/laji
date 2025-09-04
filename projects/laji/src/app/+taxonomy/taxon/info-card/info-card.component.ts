import { map, switchMap } from 'rxjs/operators';
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
import { GalleryService } from '../../../shared/gallery/service/gallery.service';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { Image } from '../../../shared/gallery/image-gallery/image.interface';
import { InfoCardQueryService } from './shared/service/info-card-query.service';
import { LoadedElementsStore } from '../../../../../../laji-ui/src/lib/tabs/tab-utils';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { TranslateService } from '@ngx-translate/core';
import { HeaderService } from '../../../shared/service/header.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];
type TaxonDescription = components['schemas']['Content'][number];

const TAB_ORDER = [ 'overview', 'images', 'identification', 'biology', 'taxonomy', 'occurrence',
                   'specimens', 'endangerment', 'invasive' ];
const BASE_PATH = '/taxon';

export type InfoCardTabType = 'overview'|'identification'|'images'|'biology'|'taxonomy'|'occurrence'|'specimens'|'endangerment'|'invasive';

@Component({
  selector: 'laji-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoCardComponent implements OnInit, OnChanges, OnDestroy {
  private tabOrder = TAB_ORDER;
  loadedTabs: LoadedElementsStore = new LoadedElementsStore(this.tabOrder);

  @Input({ required: true }) taxon!: Taxon;
  @Input({ required: true }) isFromMasterChecklist!: boolean;
  @Input({ required: true }) context!: string;
  @Input() set activeTab(tab: InfoCardTabType) {
    this.selectedTab = tab;
    this.loadedTabs.load(tab);
  }
  get activeTab() {
    // @ts-ignore
    return this.selectedTab;
  }

  selectedTab = 'overview'; // stores which tab index was provided by @Input

  taxonDescription!: TaxonDescription[];
  taxonImages!: Image[];

  hasImageData?: boolean;
  hasBiologyData?: boolean;
  isEndangered?: boolean;
  isInvasive?: boolean;
  images: any[] = [];

  sub?: Subscription;

  private imageSub?: Subscription;

  @Output() routeUpdate = new EventEmitter();

  constructor(
    private cd: ChangeDetectorRef,
    private galleryService: GalleryService,
    private localizeRouterService: LocalizeRouterService,
    private router: Router,
    private headerService: HeaderService,
    private translate: TranslateService
  ) {}

  ngOnInit() {

    if (this.hasImageData === undefined) {
      this.hasImageData = this.activeTab === 'images';
    }

  }

  onSelect(tabIndex: number) {
    const tabName = this.getTabNameFromVisibleIndex(tabIndex);
    const route = [BASE_PATH, this.taxon.id];
    if (tabName !== 'overview') { route.push(tabName); }
    this.router.navigate(
      this.localizeRouterService.translateRoute(route),
      { queryParamsHandling: 'preserve' }
    );
    this.setTitle(tabName);
    this.cd.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.activeTab) {
      if (!this.tabOrder.includes(this.activeTab)) {
        this.updateRoute(this.taxon.id, 'overview', this.context, true);
      }
      this.setTitle(this.activeTab);
    }
    if (changes.taxon) {
      this.taxonImages = (this.taxon.multimedia || []).map((img: any) => {
        if (img['taxon']) {
          img['taxonId'] = img['taxon']['id'];
          img['vernacularName'] = img['taxon']['vernacularName'];
          img['scientificName'] = img['taxon']['scientificName'];
        }
        return img;
      });
      this.taxonDescription = (this.taxon.descriptions || []).filter(desc => desc.title);
      this.hasBiologyData = this.taxonDescription.length > 0;
      this.isEndangered = this.getIsEndangered(this.taxon);
      this.isInvasive = this.taxon.invasiveSpecies;

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
    this.activeTab = tab;
    this.routeUpdate.emit({id, tab, context, replaceUrl});
    this.cd.markForCheck();
  }

  private setImages() {
    if (this.imageSub) {
      this.imageSub.unsubscribe();
    }

    this.images = [];

    const nbrOfImages = this.taxon.species ? 1 : 9;

    const taxonImages = (this.taxonImages || []).filter(image => !image['keywords']?.includes('skeletal')).slice(0, nbrOfImages);
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

  private getIsEndangered(taxon: Taxon): boolean {
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
  private getTabConditionals(): {e?: boolean; t: string}[] {
    return [
      {e: this.hasImageData, t: 'images'},
      {e: this.hasBiologyData, t: 'biology'},
      {e: this.isFromMasterChecklist, t: 'specimens'},
      {e: this.isEndangered, t: 'endangerment'},
      {e: this.isInvasive, t: 'invasive'},
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

  private setTitle(tabName: string) {
    let metaTitle = this.taxon.vernacularName && this.taxon.vernacularName[<any>this.translate.currentLang] || '';
    if (metaTitle) {
      const alternativeNames: string[] = [];
      if (this.taxon?.alternativeVernacularName?.[<any>this.translate.currentLang]) {
        alternativeNames.push(...this.taxon.alternativeVernacularName[<any>this.translate.currentLang]);
      }
      if (this.taxon?.colloquialVernacularName?.[<any>this.translate.currentLang]) {
        alternativeNames.push(...this.taxon.colloquialVernacularName[<any>this.translate.currentLang]);
      }
      metaTitle += alternativeNames.length ? ' (' + alternativeNames.join(', ') + ')' : '';
    }
    metaTitle += metaTitle ? ' - ' + this.taxon.scientificName : this.taxon.scientificName;
    metaTitle += ' | ' + this.translate.instant('taxonomy.' + tabName) + ' | ' + this.translate.instant('footer.title1');
    this.headerService.setHeaders({
      title: metaTitle
    });
  }
}
