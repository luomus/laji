import {Component, OnInit, Input} from '@angular/core';
import { PAGINATION_DIRECTIVES } from 'ng2-bootstrap/ng2-bootstrap';
import {FORM_DIRECTIVES} from '@angular/forms';
import {Subscription} from "rxjs";

import {WarehouseQueryInterface, PagedResult} from "../../model";
import {WarehouseApi} from "../../api";
import {ValueDecoratorService} from './value-decorator.sevice';
import {SearchQueryService} from "../query.service";
import {Location} from "@angular/common";



@Component({
  selector: 'laji-search-result-list',
  templateUrl: 'search-result-list.component.html',
  directives: [ PAGINATION_DIRECTIVES, FORM_DIRECTIVES ],
  providers: [WarehouseApi, ValueDecoratorService]
})
export class SearchResultListComponent implements OnInit {

  @Input() columns: any = [
    {field: 'unit.linkings.taxon'},
    {field: 'gathering.team'},
    {field: 'gathering.eventDate'},
    {field: 'gathering.conversions.wgs84CenterPoint'},
    {field: 'document.documentId'}
  ];
  @Input() showPager:boolean = true;

  public result: PagedResult<any>;

  public loading:boolean = true;

  private sub:Subscription;

  constructor(
    private warehouseService:WarehouseApi,
    private decorator:ValueDecoratorService,
    private searchQuery: SearchQueryService,
    private location: Location
  ) {

  }

  ngOnInit() {
    this.result = {
      total: this.searchQuery.page * this.searchQuery.pageSize,
      pageSize: this.searchQuery.pageSize,
      currentPage: this.searchQuery.page,
      results: []
    };
    this.fetchRows(this.searchQuery.page, this.searchQuery.pageSize);
  }

  pageChanged(event:any):void {
    if (this.searchQuery.page !== event.page) {
      this.fetchRows(event.page, this.searchQuery.pageSize);
    }
  }

  fetchRows(page:number, pageSize:number):void {
    let fields = this.columns.map((column) => column.field);
    this.loading = true;
    if (this.sub) {
      this.sub.unsubscribe();
    }
    this.sub = this.warehouseService
      .warehouseQueryListGet(this.searchQuery.query, true, fields, ['gathering.eventDate.begin desc'], pageSize, page)
      .subscribe(
      results => {
        this.searchQuery.page = results.currentPage;
        this.result = results;
        this.loading = false;
        let query = this.searchQuery.getQueryString().toString().replace(/&/g,';');
        query = query.length > 0 ? ';' + query : '';
        this.location.go(this.location.path(false).split(';')[0] + query);
      },
      error => {
        console.log(error);
        this.result.results = [];
        this.loading = false;
      }
    )
  }

  getData(row:any, propertyName:string):string {
    let val = '';
    try {
      val = propertyName.split('.').reduce((prev:any, curr:any) => prev[curr], row);
      val = this.decorator.decorate(propertyName, val, row)
    } catch(e) {}
    return val;
  }
}
