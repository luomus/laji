import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { InformalTaxonGroupApi } from '../shared/api/InformalTaxonGroupApi';
import { InformalTaxonGroup } from '../shared/model/InformalTaxonGroup';


@Component({
  selector: 'laji-taxonomy',
  templateUrl: './taxon.component.html',
  styleUrls: ['./taxon.component.css']
})
export class TaxonComponent implements OnInit, OnDestroy {
  public selectedInformalGroup: InformalTaxonGroup;
  private subTrans: Subscription;

  constructor(
    public translate: TranslateService,
    private informalTaxonService: InformalTaxonGroupApi
  ) { }

  ngOnInit() {
    this.refreshInformalGroups();
    this.subTrans = this.translate.onLangChange.subscribe(this.refreshInformalGroups.bind(this));
  }

  ngOnDestroy() {
    this.subTrans.unsubscribe();
  }

  refreshInformalGroups() {
    this.informalTaxonService
      .informalTaxonGroupFindRoots(this.translate.currentLang)
      .subscribe(this.setSelectedInformalGroup.bind(this));
  }

  setSelectedInformalGroup(data: InformalTaxonGroup) {
    this.selectedInformalGroup = data;
  }
}
