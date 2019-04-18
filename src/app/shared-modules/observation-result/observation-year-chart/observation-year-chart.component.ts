import {Component, OnChanges, OnDestroy, Input, Output, ChangeDetectorRef, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-observation-year-chart',
  templateUrl: './observation-year-chart.component.html',
  styleUrls: ['./observation-year-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationYearChartComponent implements OnChanges, OnDestroy {
  @Input() query: any;
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
    console.log('o');
    this.updateData();
  }

  ngOnDestroy() {
    if (this.getDataSub) {
      this.getDataSub.unsubscribe();
    }
  }

  private updateData() {
    if (this.getDataSub) {
      this.getDataSub.unsubscribe();
    }

    this.data = undefined;
    this.getDataSub = this.warehouseApi.warehouseQueryAggregateGet(
      this.query,
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

      this.allData = [];
      let prevYear: number;
      res.map(r => {
        const year = parseInt(r.aggregateBy['gathering.conversions.year'], 10);
        const count = r.count;

        if (prevYear) {
          for (let i = prevYear + 1; i < year; i++) {
            this.allData.push({name: i, value: 0});
            if (i < 1970) {
              this.splitIdx++;
            }
          }
        }

        this.allData.push({name: year, value: count});
        if (year < 1970) {
          this.splitIdx++;
        }

        prevYear = year;
      });
      this.data = this.allData.slice(this.splitIdx, this.allData.length);
      this.hasData.emit(this.allData.length > 0);

      this.cd.markForCheck();
    });
  }

  xAxisTickFormatting(value: number) {
    return value + '';
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
