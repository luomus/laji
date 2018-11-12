import { Component, Input, OnInit } from '@angular/core';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { TranslateService } from '@ngx-translate/core';
import { TaxonService } from '../../iucn-shared/service/taxon.service';

@Component({
  selector: 'laji-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.css']
})
export class InfoCardComponent implements OnInit {

  public taxon: Taxonomy;
  public activeIucnYear: number;

  constructor(
    private taxonService: TaxonService,
    private translateService: TranslateService
  ) { }

  ngOnInit() {
  }

  @Input()
  set taxonId(id: string) {
    if (!id) {
      this.taxon = null;
      return;
    }
    this.taxonService.getTaxon(id, this.translateService.currentLang)
      .subscribe(taxon => {
        this.activeIucnYear = taxon.latestRedListStatusFinland && taxon.latestRedListStatusFinland.year || null;
        this.taxon = taxon;
      });
  }
}
