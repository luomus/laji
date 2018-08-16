
import { throwError as observableThrowError, Subscription, Observable, of as ObservableOf, forkJoin as ObservableForkJoin } from 'rxjs';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnDestroy, OnInit, PLATFORM_ID,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Logger } from '../../shared/logger/logger.service';
import { Taxonomy, TaxonomyDescription, TaxonomyImage } from '../../shared/model/Taxonomy';
import { TaxonomyApi } from '../../shared/api/TaxonomyApi';
import { ObservationMapComponent } from '../../shared-modules/observation-map/observation-map/observation-map.component';
import { Title } from '@angular/platform-browser';
import { combineLatest, map, switchMap, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'laji-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InfoCardComponent implements OnInit, OnDestroy {
  @ViewChild(ObservationMapComponent) map: ObservationMapComponent;

  public taxon: Taxonomy;
  public taxonDescription: Array<TaxonomyDescription>;
  public taxonImages: Array<TaxonomyImage>;
  public activePanel = 0;
  public activeImage = 1;
  public activeImageTab: string;
  public hasCollectionImages = false;
  public hasTaxonImages = true;
  public hasDescription = true;
  public activeDescription = 0;
  public loading = false;

  @Input() public taxonId: string;
  public context: string;

  private subParam: Subscription;

  constructor(
    public translate: TranslateService,
    private taxonService: TaxonomyApi,
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
          this.context = data[0]['context'] || 'default';
          this.activeImage = 1;
          return {...data[1], ...data[0]}
        }),
        switchMap(() => this.initTaxon())
      )
        .subscribe(() => {
          this.cd.markForCheck();
        });
    }
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
    if (!this.taxon || !this.taxon.checklist) {
      return false;
    }
    return this.taxon.checklist.indexOf('MR.1') > -1;
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
    return ObservableForkJoin(
      this.getTaxon(this.taxonId),
      this.getTaxonDescription(this.taxonId),
      this.getTaxonMedia(this.taxonId)
    ).pipe(
      map(data => ({taxon: data[0], descriptions: data[1], media: data[2]})),
      tap(data => {
        this.loading = false;
        this.taxon = data.taxon;
        // this.taxon['skosExactMatch'] = '2627C0';
        // this.taxon['skosExactMatch'] = 'B2B21A';
        this.taxonDescription = data.descriptions;
        this.hasDescription = data.descriptions.length > 0;
        this.hasTaxonImages = data.media.length > 0;
        this.activeImageTab = this.hasTaxonImages ? 'taxon' : 'collection';
        this.taxonImages = data.media;
        this.hasCollectionImages = false;
        this.taxonDescription.map((description, idx) => {
          if (description.id === this.context) {
            this.activeDescription = idx;
          }
        });
        this.setTitle();
        this.updateMap();
      })
    )
  }

  private setTitle() {
    let title = this.taxon.vernacularName && this.taxon.vernacularName[this.translate.currentLang] || '';
    title += title ? ' (' + this.taxon.scientificName + ')' : this.taxon.scientificName;
    this.title.setTitle((title ? title + ' | '  : '') + this.title.getTitle());
  }

  private getTaxon(id) {
    return this.taxonService
      .taxonomyFindBySubject(id, 'multi')
      .retryWhen(errors => errors.delay(1000).take(3).concat(observableThrowError(errors)))
      .catch(err => {
        this.logger.warn('Failed to fetch taxon by id', err);
        return ObservableOf({});
      });
  }

  private getTaxonDescription(id) {
    return this.taxonService
      .taxonomyFindDescriptions(id, this.translate.currentLang, false)
      .catch(err => {
        this.logger.warn('Failed to fetch taxon description by id', err);
        return ObservableOf([]);
      })
      .map(descriptions => descriptions.reduce((prev, current) => {
          if (!current.title) {
            return prev;
          }
          prev.push(current);
          return prev;
        }, [])
      );

  }

  private getTaxonMedia(id) {
    return this.taxonService
      .taxonomyFindMedia(id, this.translate.currentLang)
      .catch(err => {
        this.logger.warn('Failed to fetch taxon media by id', err);
        return ObservableOf([]);
      });
  }
}
