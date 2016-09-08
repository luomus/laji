import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import {Subscription} from "rxjs";
import {PAGINATION_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';
import {FORM_DIRECTIVES} from '@angular/forms';

import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {SearchQuery} from "../search-query.model";
import {TranslateService} from "ng2-translate";
import {ROUTER_DIRECTIVES} from "@angular/router";
import {SpinnerComponent} from "../../shared/spinner/spinner.component";

@Component({
  moduleId: module.id,
  selector: 'laji-observation-aggregate',
  templateUrl: 'observation-aggregate.component.html',
  directives: [
    PAGINATION_DIRECTIVES,
    FORM_DIRECTIVES,
    ROUTER_DIRECTIVES,
    SpinnerComponent
  ]
})
export class ObservationAggregateComponent implements OnInit, OnDestroy {

  @Input() title:string = '';
  @Input() field:string;
  @Input() limit:number = 10;
  @Input() hideOnEmpty:boolean = false;
  @Input() updateOnLangChange:boolean = false;
  @Input() queryOverride:any;
  @Input() valuePicker:any;
  @Input() showPager:boolean = false;
  @Input() linkPicker:(any)=>{
    local:string,
    content:string
  };

  public page:number = 1;
  public total:number = 1;
  public loading:boolean = false;

  public items:Array<{
    count:number,
    value:string,
    link?:{
      local:string,
      content:string
    },
    linkContent?:string
  }> = [];

  private subQueryUpdate:Subscription;
  private subCount:Subscription;

  constructor(
    private warehouseService: WarehouseApi,
    private searchQuery: SearchQuery,
    private translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(query => this.updateCount());
    this.translate.onLangChange.subscribe(
      () => {
        if (this.updateOnLangChange) {
          this.updateCount();
        }
      }
    );
    this.updateCount();
  }

  ngOnDestroy() {
    if (this.subQueryUpdate) {
      this.subQueryUpdate.unsubscribe();
    }
    if (this.subCount) {
      this.subCount.unsubscribe();
    }
  }

  pageChanged(page) {
    this.page = page.page;
    this.items = [];
    this.updateCount();
  }

  updateCount() {
    if (this.subCount) {
      this.subCount.unsubscribe();
    }
    let query = Object.assign({}, this.searchQuery.query);
    if (this.queryOverride) {
      query = Object.assign(query, this.queryOverride);
    }
    query.includeNonValidTaxons = false;
    this.loading = true;
    this.subCount = this.warehouseService
      .warehouseQueryAggregateGet(query, [this.field], undefined, this.limit, this.page)
      .subscribe(
        result => {
          if (result.results) {
            this.total = result.total;
            this.items = result.results
              .map(item => {
                let link = undefined;
                let value = this.valuePicker ?
                  this.valuePicker(item.aggregateBy, this.translate.currentLang) :
                  (item.aggregateBy[this.field] || '');
                if (this.linkPicker) {
                  link = this.linkPicker(item.aggregateBy);
                }
                console.log(link);
                return {count: item.count, value: value, link: link};
              });
          }
        },
        err => console.log(err),
        () => this.loading = false
      );
  }
}
