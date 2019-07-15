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
  newData: any[] = [{data: [], label: 'A'}];
  splitIdx = 0;

  private allData: any[];
  private allSubData: any[];
  private getDataSub: Subscription;
  private allDataNew: any[];

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

  private updateData() {
    console.log('hola');
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
      this.allSubData = [];
      this.allDataNew = [{data: [], label: 'A' }];
      let prevYear: number;
      res.map(r => {
        const year = parseInt(r.aggregateBy['gathering.conversions.year'], 10);
        const count = r.count;

        if (prevYear) {
          for (let i = prevYear + 1; i < year; i++) {
            this.allData.push({name: i, value: 0});
            this.allSubData.push(0);
            if (i < 1970) {
              this.splitIdx++;
            }
          }
        }

        this.allData.push({name: year, value: count});
        this.allSubData.push(count);
        if (year < 1970) {
          this.splitIdx++;
        }

        prevYear = year;
      });
      this.data = this.allData.slice(this.splitIdx, this.allData.length);

      this.allDataNew[0].data = this.allSubData;

      this.allSubData = this.allSubData.slice(this.splitIdx, this.allSubData.length);
      this.newData[0].data = this.allSubData;

      this.hasData.emit(this.allData.length > 0);
      // check emit
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

  toggleShowAllDataGiorgio() {
    if (this.newData[0].data.length < this.allDataNew[0].data.length) {
      this.newData[0].data = this.allDataNew[0].data;
    } else {
      this.newData[0].data = this.allData.slice(this.splitIdx, this.allDataNew[0].data.length);
    }
  }
}
