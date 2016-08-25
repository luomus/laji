import {Component, OnInit, Input} from '@angular/core';
import {FORM_DIRECTIVES}   from '@angular/forms';
import {Location} from "@angular/common";

import {SearchQuery} from "../search-query.model";
import {ObservationCountComponent} from "../count/observation-cont.component";
import {WarehouseQueryInterface} from "../../shared/model/WarehouseQueryInterface";
import {ObservationChartComponent} from "../chart/observation-chart.component";
import {ObservationResultListComponent} from "../result-list/observation-result-list.component";
import {ObservationResultComponent} from "../result-tabs/observation-result.component";

@Component({
  selector: 'laji-observation-form',
  templateUrl: 'observation-form.component.html',
  directives: [
    FORM_DIRECTIVES,
    ObservationCountComponent,
    ObservationChartComponent,
    ObservationResultComponent
  ]
})
export class ObservationFormComponent implements OnInit {

  public query;
  @Input() tab:string;

  constructor(public searchQuery: SearchQuery, private location:Location) {
  }

  ngOnInit() {
    this.empty(false, this.searchQuery.query);
  }

  updateTime(dates) {
    if (dates === 365) {
      let today = new Date();
      let oneJan = new Date(today.getFullYear(),0,1);
      dates = Math.ceil(((+today) - (+oneJan)) / 86400000);
    }
    this.query.time = '-' + dates + '/0';
    this.onSubmit();
  }

  toggle(field:string) {
    this.query[field] = !this.query[field];
    this.onSubmit();
  }

  empty(refresh:boolean, query?:WarehouseQueryInterface) {
    if (query) {
      this.query = {
        taxon: query.target && query.target[0] ? query.target[0] : '',
        time: query.time && query.time[0] ? query.time[0] : '',
        specimen: query.recordBasis && query.recordBasis[0] && query.recordBasis[0] === 'PRESERVED_SPECIMEN' ? true : false,
        typeSpecimen: query.typeSpecimen || false,
        informalTaxonGroupId: query.informalTaxonGroupId || ''
      };
      return;
    }
    this.query = {
      taxon:'',
      time:'',
      specimen: false,
      typeSpecimen: false,
      informalTaxonGroupId:''
    };
    if (refresh) {
      this.onSubmit();
    }
  }

  onSubmit() {

    let taxon = this.query.taxon.trim();
    let time = this.query.time.trim();

    this.searchQuery.query.target = taxon.length > 0 ? [taxon] : undefined;
    this.searchQuery.query.time = time.length > 0 ? [time] : undefined;
    this.searchQuery.query.typeSpecimen = this.query.typeSpecimen ? true : undefined;
    this.searchQuery.query.recordBasis = this.query.specimen ? ['PRESERVED_SPECIMEN'] : undefined;
    this.searchQuery.query.informalTaxonGroupId = this.query.informalTaxonGroupId ? this.query.informalTaxonGroupId : undefined;

    this.searchQuery.queryUpdate();
    this.searchQuery.updateUrl(this.location);
    return false;
  }

}
