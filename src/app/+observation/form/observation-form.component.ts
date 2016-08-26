import {Component, OnInit, Input} from '@angular/core';
import {FORM_DIRECTIVES}   from '@angular/forms';
import {Location} from "@angular/common";

import {SearchQuery} from "../search-query.model";
import {ObservationCountComponent} from "../count/observation-cont.component";
import {WarehouseQueryInterface} from "../../shared/model/WarehouseQueryInterface";
import {ObservationChartComponent} from "../chart/observation-chart.component";
import {ObservationResultComponent} from "../result-tabs/observation-result.component";
import {Observable} from "rxjs";
import {TYPEAHEAD_DIRECTIVES} from "ng2-bootstrap";
import {AutocompleteApi} from "../../shared/api/AutocompleteApi";
import {TranslateService} from "ng2-translate";

@Component({
  selector: 'laji-observation-form',
  templateUrl: 'observation-form.component.html',
  providers: [AutocompleteApi],
  directives: [
    FORM_DIRECTIVES,
    ObservationCountComponent,
    ObservationChartComponent,
    ObservationResultComponent,
    TYPEAHEAD_DIRECTIVES
  ]
})
export class ObservationFormComponent implements OnInit {

  public limit = 10;
  public formQuery;
  public dataSource:Observable<any>;
  public typeaheadLoading:boolean = false;
  @Input() tab:string;

  constructor(
    public searchQuery: SearchQuery,
    private location:Location,
    private autocompleteService:AutocompleteApi,
    private translate: TranslateService
  ) {
    this.dataSource = Observable.create((observer:any) => {
      observer.next(this.formQuery.taxon);
    }).mergeMap((token:string) => this.getTaxa(token));
  }

  public getTaxa(token:string):Observable<any> {
    return this.autocompleteService.autocompleteFindByField(
      'taxon',
      token,
      '' + this.limit,
      true,
      this.translate.currentLang
    )
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
    this.formQuery.timeStart = '-' + dates + '/0';
    this.onSubmit();
  }

  toggle(field:string) {
    this.formQuery[field] = !this.formQuery[field];
    this.onSubmit();
  }

  empty(refresh:boolean, query?:WarehouseQueryInterface) {
    if (query) {
      this.formQuery = {
        taxon: query.target && query.target[0] ? query.target[0] : '',
        timeStart: query.time && query.time[0] ? query.time[0] : '',
        specimen: query.recordBasis && query.recordBasis[0] && query.recordBasis[0] === 'PRESERVED_SPECIMEN' ? true : false,
        typeSpecimen: query.typeSpecimen || false,
        informalTaxonGroupId: query.informalTaxonGroupId || ''
      };
      return;
    }
    this.formQuery = {
      taxon:'',
      timeStart:'',
      specimen: false,
      typeSpecimen: false,
      informalTaxonGroupId:''
    };
    if (refresh) {
      this.onSubmit();
    }
  }

  onSubmit() {
    let taxon = this.formQuery.taxon.trim();
    let time = this.formQuery.timeStart.trim();

    this.searchQuery.query.target = taxon.length > 0 ? [taxon] : undefined;
    this.searchQuery.query.time = time.length > 0 ? [time] : undefined;
    this.searchQuery.query.typeSpecimen = this.formQuery.typeSpecimen ? true : undefined;
    this.searchQuery.query.recordBasis = this.formQuery.specimen ? ['PRESERVED_SPECIMEN'] : undefined;
    this.searchQuery.query.informalTaxonGroupId = this.formQuery.informalTaxonGroupId ? this.formQuery.informalTaxonGroupId : undefined;

    this.searchQuery.queryUpdate();
    this.searchQuery.updateUrl(this.location);
    return false;
  }

  public changeTypeaheadLoading(e:boolean):void {
    this.typeaheadLoading = e;
  }

  public typeaheadOnSelect(e:any):void {
    console.log('Selected value: ',e.item);
  }

}
