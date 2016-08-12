import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import {Subscription} from "rxjs";

import {FormattedNumber} from "../../shared";
import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {SearchQuery} from "../search-query.model";


@Component({
  moduleId: module.id,
  selector: 'laji-observation-count',
  template: `<span [innerHtml]="count | formattedNumber:'&nbsp'"></span>`,
  pipes: [FormattedNumber]
})
export class ObservationCountComponent implements OnInit, OnDestroy {

  @Input() field: string;
  @Input() pick: any;

  public count: string = '';

  private subQueryUpdate: Subscription;
  private subCount: Subscription;

  constructor(private warehouseService: WarehouseApi, private searchQuery: SearchQuery) {
  }

  ngOnInit() {
    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(query => this.updateCount());
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
      .warehouseQueryAggregateGet(this.searchQuery.query, [this.field])
      .subscribe(
        result => {
          if (result.results) {
            this.count = '' + result.results
              .filter(value => value.aggregateBy[this.field] === this.pick)
              .reduce((pre, cur) =>  cur['count'], 0);
          }
        }
      );
  }

}
