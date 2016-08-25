import {Component, OnInit, Input, OnDestroy, OnChanges} from '@angular/core';
import {Subscription} from "rxjs";

import {FormattedNumber, SpinnerComponent} from "../../shared";
import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {SearchQuery} from "../search-query.model";
import {WarehouseQueryInterface} from "../../shared/model/WarehouseQueryInterface";


@Component({
  moduleId: module.id,
  selector: 'laji-observation-count',
  templateUrl: 'observation-cont.component.html',
  directives: [ SpinnerComponent ],
  pipes: [ FormattedNumber ]
})
export class ObservationCountComponent implements OnInit, OnDestroy, OnChanges {

  @Input() field: string;
  @Input() pick: any;
  @Input() query: WarehouseQueryInterface;

  public count: string = '';
  public loading:boolean = true;

  private lastResult:WarehouseQueryInterface;
  private subQueryUpdate: Subscription;
  private subCount: Subscription;

  constructor(private warehouseService: WarehouseApi, private searchQuery: SearchQuery) {
  }

  ngOnInit() {
    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(query => this.update());
    this.update();
  }

  ngOnChanges() {
    this.update();
  }

  ngOnDestroy() {
    if (this.subQueryUpdate) {
      this.subQueryUpdate.unsubscribe();
    }
    if (this.subCount) {
      this.subCount.unsubscribe();
    }
  }

  update() {
    if (this.subCount) {
      this.subCount.unsubscribe();
    }
    this.loading = true;
    let query = this.query ? this.query : this.searchQuery.query;
    if (JSON.stringify(query) == this.query) {
      console.log('Skipping since same query');
      this.loading = false;
      return;
    }
    if (this.field) {
      this.updateAggregated(query);
    } else {
      this.updateCount(query);
    }
  }

  private updateCount(query) {
    this.subCount = this.warehouseService
      .warehouseQueryCountGet(this.searchQuery.query)
      .subscribe(
        result => {
          this.lastResult = JSON.stringify(query);
          this.loading = false;
          this.count = '' + result.total;
        },
        err => console.log(err)
      )
  }

  private updateAggregated(query) {
    this.subCount = this.warehouseService
      .warehouseQueryAggregateGet(query, [this.field])
      .subscribe(
        result => {
          if (result.results) {
            this.lastResult = JSON.stringify(query);
            this.loading = false;
            this.count = '' + result.results
                .filter(value => value.aggregateBy[this.field] === this.pick)
                .reduce((pre, cur) =>  cur['count'], 0);
          }
        },
        err => console.log(err)
      );
  }
}
