import {Component, OnInit} from '@angular/core';
import {FORM_DIRECTIVES, NgModel}   from '@angular/forms';

import {SearchQuery} from "../search-query.model";
import {ObservationCountComponent} from "../count/obesrvation-cont.component";

@Component({
  selector: 'laji-observation-form',
  templateUrl: 'observation-form.component.html',
  directives: [ FORM_DIRECTIVES, ObservationCountComponent ]
})
export class ObservationFormComponent {

  public query;

  constructor(public searchQuery: SearchQuery) {
    this.empty();
  }

  updateTime(dates) {
    if (dates === 365) {
      let today = new Date();
      var oneJan = new Date(today.getFullYear(),0,1);
      dates = Math.ceil(((+today) - (+oneJan)) / 86400000);
    }
    this.query.time = '-' + dates + '/0';
    this.onSubmit();
  }

  toggle(field:string) {
    this.query[field] = !this.query[field];
    this.onSubmit();
  }

  empty() {
    this.query = {
      taxon:'',
      time:'',
      specimen: false,
      typeSpecimen: false
    };
  }

  onSubmit() {

    let taxon = this.query.taxon.trim();
    let time = this.query.time.trim();

    this.searchQuery.query.target = taxon.length > 0 ? [taxon] : undefined;
    this.searchQuery.query.time = time.length > 0 ? [time] : undefined;
    this.searchQuery.query.typeSpecimen = this.query.typeSpecimen ? true : undefined;
    this.searchQuery.query.recordBasis = this.query.specimen ? ['PRESERVED_SPECIMEN'] : undefined;

    this.searchQuery.queryUpdate();
    return false;
  }

}
