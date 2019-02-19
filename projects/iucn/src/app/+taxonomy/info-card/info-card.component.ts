import { Component, Input, OnChanges } from '@angular/core';
import { RedListEvaluation, Taxonomy } from '../../../../../../src/app/shared/model/Taxonomy';
import { TranslateService } from '@ngx-translate/core';
import { TaxonService } from '../../iucn-shared/service/taxon.service';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../../../../src/app/locale/localize-router.service';
import { ResultService } from '../../iucn-shared/service/result.service';

@Component({
  selector: 'laji-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.css']
})
export class InfoCardComponent implements OnChanges {

  public taxon: Taxonomy;
  public taxonAutocomplete: string;
  public latestStatus: RedListEvaluation;
  public isEndangered: boolean;
  public activeIucnYear: number;

  @Input() private taxonId: string;
  @Input() private checklistId: string;

  constructor(
    private taxonService: TaxonService,
    private resultService: ResultService,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private translateService: TranslateService
  ) { }

  ngOnChanges() {
    this.initTaxon();
  }

  initTaxon() {
    if (!this.taxonId) {
      this.taxon = null;
      return;
    }
    this.taxonAutocomplete = '';
    this.taxonService.getTaxon(this.taxonId, this.translateService.currentLang, this.checklistId)
      .subscribe(taxon => {
        this.activeIucnYear = taxon.latestRedListStatusFinland && taxon.latestRedListStatusFinland.year || null;
        this.latestStatus = taxon.latestRedListEvaluation || null;
        this.isEndangered = this.latestStatus && this.resultService.endangered.includes(this.latestStatus.redListStatus);
        this.taxon = taxon;
      });
  }

  taxonSelect(event: string) {
    if (event) {
      this.router.navigate(this.localizeRouterService.translateRoute(['/taxon', event]), {queryParams: {
          checklist: this.checklistId
        }});
    }
  }
}
