import { Component, Input, OnChanges } from '@angular/core';
import { RedListEvaluation, Taxonomy } from '../../../../../../src/app/shared/model/Taxonomy';
import { TranslateService } from '@ngx-translate/core';
import { TaxonService } from '../../iucn-shared/service/taxon.service';
import { ResultService } from '../../iucn-shared/service/result.service';
import { Title } from '@angular/platform-browser';

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
    private translateService: TranslateService,
    private title: Title
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
        this.setTitle();
      });
  }

  private setTitle() {
    let title = this.taxon.vernacularName;
    if (!title) {
      title = this.taxon.scientificName;
    }
    if (this.isEndangered) {
      title += ' - ' + 'Uhanalainen:';
    }
    title += ' ' + (this.latestStatus ? this.translateService.instant('iucn.taxon.' + this.latestStatus.redListStatus) : '');
    title = title.toLocaleLowerCase();
    title = title.charAt(0).toLocaleUpperCase() + title.slice(1);
    this.title.setTitle(title + ' | ' + this.title.getTitle());
  }
}
