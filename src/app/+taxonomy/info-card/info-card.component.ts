import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute } from '@angular/router';
import { Logger } from '../../shared/logger/logger.service';
import { Taxonomy, TaxonomyDescription, TaxonomyImage } from '../../shared/model/Taxonomy';
import { TaxonomyApi } from '../../shared/api/TaxonomyApi';
import { ObservationMapComponent } from '../../+observation/map/observation-map.component';
import { Observable } from 'rxjs/Observable';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'laji-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.css']
})
export class InfoCardComponent implements OnInit, OnDestroy {
  @ViewChild(ObservationMapComponent) map: ObservationMapComponent;

  public taxon: Taxonomy;
  public taxonDescription: Array<TaxonomyDescription>;
  public taxonImages: Array<TaxonomyImage>;
  public activePanel = 0;
  public activeImage = 1;
  public activeImageTab: string;
  public hasCollectionImages = true;
  public hasTaxonImages = true;
  public hasDescription = true;
  public activeDescription = 0;
  public loading = false;

  @Input() public taxonId: string;
  public context: string;

  private subParam: Subscription;
  private subTrans: Subscription;

  constructor(
    private taxonService: TaxonomyApi,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private logger: Logger,
    private router: Router,
    private title: Title
  ) { }

  ngOnInit() {
    if (!this.taxonId) {
      this.subParam = this.route.params
        .combineLatest(
          this.route.queryParams,
          ((params, queryParams) => ({...queryParams, ...params}))
        )
        .subscribe(params => {
          this.taxonId = params['id'];
          this.context = params['context'] || 'default';
          this.activeImage = 1;
          this.initTaxon();
        });
    }

    this.taxonDescription = [];
    this.taxonImages = [];

    this.subTrans = this.translate.onLangChange
      .do(() => this.loading = true)
      .delay(0)
      .switchMap(() => {
        return Observable.forkJoin(
          this.getTaxonDescription(this.taxonId),
          this.getTaxonMedia(this.taxonId)
        );
      })
      .subscribe((data) => {
        this.taxonDescription = data[0];
        this.hasDescription = data[0].length > 0;
        this.taxonImages = data[1];
        this.loading = false;
        this.taxonDescription.map((description, idx) => {
          if (description.id === this.context) {
            this.activeDescription = idx;
          }
        });
        this.updateMap();
      }
    );
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
    this.subTrans.unsubscribe();
  }

  onDescriptionChange(context: string) {
    this.router.navigate([], {
      queryParams: (context === 'default' ? {} : {context: context}),
      replaceUrl: true
    });
  }

  private updateMap() {
    if (!this.map) {
      return;
    }
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100);
  }

  private initTaxon() {
    this.loading = true;
    this.getTaxon(this.taxonId);
    this.getTaxonDescription(this.taxonId);
    this.getTaxonMedia(this.taxonId);
    Observable.forkJoin(
      this.getTaxon(this.taxonId),
      this.getTaxonDescription(this.taxonId),
      this.getTaxonMedia(this.taxonId),
      (taxon, descriptions, media) => ({taxon, descriptions, media})
    )
      .subscribe(data => {
        this.loading = false;
        this.taxon = data.taxon;
        this.taxonDescription = data.descriptions;
        this.hasDescription = data.descriptions.length > 0;
        this.hasTaxonImages = data.media.length > 0;
        this.activeImageTab = this.hasTaxonImages ? 'taxon' : 'collection';
        this.taxonImages = data.media;
        this.taxonDescription.map((description, idx) => {
          if (description.id === this.context) {
            this.activeDescription = idx;
          }
        });
        this.setTitle();
        this.updateMap();
      });
  }

  private setTitle() {
    let title = this.taxon.vernacularName && this.taxon.vernacularName[this.translate.currentLang] || '';
    title += title ? ' (' + this.taxon.scientificName + ')' : this.taxon.scientificName;
    this.title.setTitle((title ? title + ' | '  : '') + this.title.getTitle());
  }

  private getTaxon(id) {
    return this.taxonService
      .taxonomyFindBySubject(id, 'multi')
      .catch(err => {
        this.logger.warn('Failed to fetch taxon by id', err);
        return Observable.of(false);
      });
  }

  private getTaxonDescription(id) {
    return this.taxonService
      .taxonomyFindDescriptions(id, this.translate.currentLang, false)
      .catch(err => {
        this.logger.warn('Failed to fetch taxon description by id', err);
        return Observable.of([]);
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
        return Observable.of([]);
      });
  }
}
