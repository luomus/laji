import {Component, OnChanges, OnDestroy, Input, Output, ChangeDetectorRef, EventEmitter} from '@angular/core';
import { WarehouseApi } from '../../../../../shared/api/WarehouseApi';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-taxon-year-graph',
  templateUrl: './taxon-year-chart.component.html',
  styleUrls: ['./taxon-year-chart.component.scss']
})
export class TaxonYearChartComponent implements OnChanges, OnDestroy {
  @Input() taxonId: string;
  data: any[];
  splitIdx = 0;

  private allData: any[];
  private getDataSub: Subscription;

  @Output() hasData = new EventEmitter<boolean>();

  constructor(
    private warehouseApi: WarehouseApi,
    private cd: ChangeDetectorRef
  ) { }

  ngOnChanges() {
    this.updateData();
  }

  ngOnDestroy() {
    if (this.getDataSub) {
      this.getDataSub.unsubscribe();
    }
  }

  updateData() {
    if (this.getDataSub) {
      this.getDataSub.unsubscribe();
    }

    this.data = undefined;
    this.getDataSub = this.warehouseApi.warehouseQueryAggregateGet(
      { taxonId: [this.taxonId] },
      ['gathering.conversions.year'],
      ['gathering.conversions.year'],
      10000,
      1,
      undefined,
      true
    ).pipe(
      map(res => res.results)
    ).subscribe(res => {
      this.splitIdx = 0;

      this.allData = res.map(r => {
          const year = r.aggregateBy['gathering.conversions.year'];
          const count = r.count;

          if (parseInt(year, 10) < 1970) {
            this.splitIdx++;
          }

          return {name: year, value: count};
      });
      this.data = this.allData.slice(this.splitIdx, this.allData.length);
      this.hasData.emit(this.allData.length > 0);

      this.cd.markForCheck();
    });
  }

  yAxisTickFormatting(value: number) {
    return value.toLocaleString('fi');
  }

  toggleShowAllData() {
    if (this.data.length < this.allData.length) {
      this.data = this.allData;
    } else {
      this.data = this.allData.slice(this.splitIdx, this.allData.length);
    }
  }
}
