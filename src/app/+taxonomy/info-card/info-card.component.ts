import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Logger } from '../../shared/logger/logger.service';
import { Taxonomy, TaxonomyDescription, TaxonomyImage } from '../../shared/model/Taxonomy';
import { TaxonomyApi } from '../../shared/api/TaxonomyApi';
import { ObservationMapComponent } from '../../+observation/map/observation-map.component';

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
  public activePanel: number = 0;
  public activeImage: number = 1;
  public activeImageTab: string;
  public hasCollectionImages = true;
  public hasTaxonImages = true;
  public hasDescription = true;
  public activeDescription: number = 0;

  @Input() public taxonId: string;

  private subParam: Subscription;
  private subTrans: Subscription;

  constructor(
    private taxonService: TaxonomyApi,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private logger: Logger
  ) { }

  ngOnInit() {
    if (!this.taxonId) {
      this.subParam = this.route.params.subscribe(params => {
        this.taxonId = params['id'];
        this.getTaxon(this.taxonId);
        this.getTaxonDescription(this.taxonId);
        this.getTaxonMedia(this.taxonId);
        this.activeImage = 1;
      });
    }

    this.taxonDescription = [];
    this.taxonImages = [];

    this.subTrans = this.translate.onLangChange.subscribe(
      () => {
        this.getTaxonDescription(this.taxonId);
        this.getTaxonMedia(this.taxonId);
      }
    );
  }

  hasData(event) {
    this.hasCollectionImages = event;
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

  private getTaxon(id) {
    this.taxonService
      .taxonomyFindBySubject(id, 'multi')
      .subscribe(
        taxonomy => this.taxon = taxonomy,
        err => this.logger.warn('Failed to fetch taxon by id', err)
      );
  }

  private getTaxonDescription(id) {
    this.taxonService
      .taxonomyFindDescriptions(id, this.translate.currentLang, false)
      .map(descriptions => descriptions.reduce((prev, current) => {
          if (!current.title) {
            return prev;
          }
          prev.push(current);
          return prev;
        }, [])
      )
      .subscribe(
        descriptions => {
          this.taxonDescription = descriptions;
          this.hasDescription = descriptions.length > 0;
          setTimeout(() => {
            this.map.invalidateSize();
          }, 100);
        },
        err => this.logger.warn('Failed to fetch taxon description by id', err)
      );

  }

  private getTaxonMedia(id) {
    this.taxonService
      .taxonomyFindMedia(id, this.translate.currentLang)
      .subscribe(media => {
          this.hasTaxonImages = media.length > 0;
          this.activeImageTab = this.hasTaxonImages ? 'taxon' : 'collection';
          this.taxonImages = media;
          setTimeout(() => {
            this.map.invalidateSize();
          }, 100);
        },
        err => this.logger.warn('Failed to fetch taxon media by id', err)
      );
  }
}
