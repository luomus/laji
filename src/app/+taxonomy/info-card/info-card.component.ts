import { Component, Input } from '@angular/core';
import { TranslateService } from "ng2-translate/ng2-translate";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";

import { Taxonomy, TaxonomyDescription, TaxonomyImage, TaxonomyApi, PanelComponent, ImageGalleryComponent } from '../../shared';

@Component({
  selector: 'laji-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.css']
})
export class InfoCardComponent {

  public taxon:Taxonomy;
  public taxonDescription:TaxonomyDescription;
  public taxonImages:Array<TaxonomyImage>;
  private subParam:Subscription;
  private subTrans:Subscription;

  private mapUrl = 'http://ws.luomus.fi/Balticdiversity/aggregated-map?mapPosition=markerBoundsNorthEastFixed&target=Parus%20major&locale=en';

  public activePanel:number = 0;
  public activeImage:number = 0;

  @Input() public taxonId:string;

  constructor(
    private taxonService: TaxonomyApi,
    private translate:TranslateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    if (!this.taxonId) {
      this.subParam = this.route.params.subscribe(params => {
        this.taxonId = params['id'];
        this.getTaxon(this.taxonId);
        this.getTaxonDescription(this.taxonId);
        this.getTaxonMedia(this.taxonId);
        this.taxonImages = [];
        this.activeImage = 0;
      });
    }

    this.subTrans = this.translate.onLangChange.subscribe(
      () => {
        this.getTaxon(this.taxonId);
        this.getTaxonDescription(this.taxonId);
        this.getTaxonMedia(this.taxonId);
      }
    )
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
      .taxonomyFindBySubject(id, this.translate.currentLang)
      .subscribe(
        taxonomy => this.taxon = taxonomy,
        err => console.log(err)
      );
  }

  private getTaxonDescription(id) {
    this.taxonService
      .taxonomyFindDescriptions(id, this.translate.currentLang)
      .subscribe(
        descriptions => this.taxonDescription = descriptions[0],
        err => console.error(err)
      )

  }

  private getTaxonMedia(id) {
    this.taxonService.taxonomyFindMedia(id, this.translate.currentLang)
    .subscribe(
      media => this.taxonImages = media,
      err => console.error(err)
    )
  }
}
