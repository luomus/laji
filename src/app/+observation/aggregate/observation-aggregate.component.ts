import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import {Subscription} from "rxjs";

import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {SearchQuery} from "../search-query.model";
import {TranslateService} from "ng2-translate";

@Component({
  moduleId: module.id,
  selector: 'laji-observation-aggregate',
  templateUrl: 'observation-aggregate.component.html'
})
export class ObservationAggregateComponent implements OnInit, OnDestroy {

  @Input() title:string = '';
  @Input() field:string;
  @Input() limit:number = 10;
  @Input() hideOnEmpty:boolean = false;
  @Input() updateOnLangChange:boolean = false;
  @Input() addPrefix:boolean = false;
  @Input() valuePicker:any;

  public items:Array<{
    count:number,
    value:string
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

  updateCount() {
    if (this.subCount) {
      this.subCount.unsubscribe();
    }
    this.subCount = this.warehouseService
      .warehouseQueryAggregateGet(this.searchQuery.query, [this.field], undefined, this.limit)
      .subscribe(
        result => {
          if (result.results) {
            this.items = result.results
              .map(item => {
                let value = this.valuePicker ?
                  this.valuePicker(item.aggregateBy, this.translate.currentLang) :
                  (item.aggregateBy[this.field] || '');
                return {count: item.count, value: value}
              });
          }
        }
      );
  }

}
