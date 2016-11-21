import { Component, Input } from '@angular/core';
import { TranslateService } from 'ng2-translate/ng2-translate';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Taxonomy, TaxonomyDescription, TaxonomyImage, TaxonomyApi } from '../../shared';
import { Logger } from '../../shared/logger/logger.service';

@Component({
  selector: 'laji-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.css']
})
export class InfoCardComponent {

  public taxon: Taxonomy;
  public taxonDescription: Array<TaxonomyDescription>;
  public taxonImages: Array<TaxonomyImage>;
  public activePanel: number = 0;
  public activeImage: number = 1;
  public activeDescription: number = 0;

  @Input() public taxonId: string;

  private subParam: Subscription;
  private subTrans: Subscription;

  constructor(private taxonService: TaxonomyApi,
              private translate: TranslateService,
              private route: ActivatedRoute,
              private logger: Logger
  ) {
  }

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
        this.getTaxon(this.taxonId);
        this.getTaxonDescription(this.taxonId);
        this.getTaxonMedia(this.taxonId);
      }
    );
  }

  setActive(event) {
    this.activePanel = event.value;
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
      .taxonomyFindDescriptions(id, 'multi')
      .subscribe(
        descriptions => this.taxonDescription = descriptions,
        err => this.logger.warn('Failed to fetch taxon description by id', err)
      );

  }

  private getTaxonMedia(id) {
    this.taxonService.taxonomyFindMedia(id, this.translate.currentLang)
      .subscribe(
        media => this.taxonImages = media,
        err => this.logger.warn('Failed to fetch taxon media by id', err)
      );
  }
}
