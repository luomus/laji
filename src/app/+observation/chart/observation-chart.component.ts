import {Component, OnInit, OnDestroy} from '@angular/core';
import {PieChartComponent} from "../../shared/chart/pie/pie-chart.component";
import {SearchQuery} from "../search-query.model";
import {WarehouseApi} from "../../shared/api/WarehouseApi";
import {Subscription} from "rxjs";

@Component({
  moduleId: module.id,
  selector: 'laji-observation-chart',
  template: '<laji-pie-chart [data]="data" [height]="300" (sectionSelect)="onPieClick($event)"></laji-pie-chart>',
  directives: [ PieChartComponent ]
})
export class ObservationChartComponent implements OnInit, OnDestroy {

  public data:any;

  private subQueryUpdate: Subscription;
  private subCount: Subscription;

  constructor(
    public searchQuery: SearchQuery,
    private warehouseService: WarehouseApi
  ) {}

  ngOnInit() {
    this.subQueryUpdate = this.searchQuery.queryUpdated$.subscribe(query => this.updateChart());
    this.updateChart();
  }

  ngOnDestroy() {
    if (this.subQueryUpdate) {
      this.subQueryUpdate.unsubscribe();
    }
    if (this.subCount) {
      this.subCount.unsubscribe();
    }
  }

  updateChart() {
    if (this.subCount) {
      this.subCount.unsubscribe();
    }
    this.subCount = this.warehouseService
      .warehouseQueryAggregateGet(this.searchQuery.query, ['unit.linkings.taxon.informalTaxonGroup'])
      .subscribe(
        result => {
          if (result.results) {
            this.data = result.results
              .map(item => {
                let val = item.aggregateBy['unit.linkings.taxon.informalTaxonGroup'];
                val = val === 'null' ? '(empty)' : val;
                return {
                id: val,
                value: item.count,
                label: val
              }});
          }
        }
      );
  }


  onPieClick(event) {
    console.log('clicked');
    console.log(event);
  }

}
