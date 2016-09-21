import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import {Subscription} from "rxjs";

import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {SearchQuery} from "../search-query.model";
import {TranslateService} from "ng2-translate";
import {Util} from "../../shared/service/util.service";

@Component({
  selector: 'laji-observation-aggregate',
  templateUrl: 'observation-aggregate.component.html'
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
  private lastCache:string;

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
    let query = Util.clone(this.searchQuery.query);
    let cache = JSON.stringify(query) + this.page;
    if (this.lastCache === cache) {
      return;
    }
    this.lastCache = cache;
    if (this.subCount) {
      this.subCount.unsubscribe();
    }
    if (this.queryOverride) {
      query = Object.assign(query, this.queryOverride);
    }
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
                return {count: item.count, value: value, link: link};
              });
          }
        },
        err => console.log(err),
        () => this.loading = false
      );
  }
}
