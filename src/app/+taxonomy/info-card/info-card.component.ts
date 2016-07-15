import {Component, Input, SimpleChange} from '@angular/core';
import { DomSanitizationService } from "@angular/platform-browser";
import { TranslateService } from "ng2-translate/ng2-translate";

import { Taxonomy, TaxonomyApi } from '../../shared';
import { InfoSectionComponent } from "./info-section.component";
import { TaxonInfoComponent } from "./taxon-info.component";

@Component({
  selector: 'laji-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.css'],
  directives: [ InfoSectionComponent, TaxonInfoComponent ]
})
export class InfoCardComponent {

  @Input() taxon: Taxonomy;

  private mapUrl = 'http://ws.luomus.fi/Balticdiversity/aggregated-map?mapPosition=markerBoundsNorthEastFixed&target=Parus%20major&locale=en';

  public active:number = 0;

  constructor(
    private taxonService: TaxonomyApi,
    private sanitizer: DomSanitizationService,
    private translate:TranslateService
  ) {}

  setActive(event) {
    this.active = event.value;
  }
}
