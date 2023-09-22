import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChartOptions, ChartType, Tooltip } from 'chart.js';
import { LabelPipe } from '../../../shared/pipe/label.pipe';
import { ChartData, ObservationMonthDayChartFacade, getNbrOfDaysInMonth } from './observation-month-day-chart.facade';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const BAR_CHART_OPTIONS: ChartOptions<any> = {
  responsive: true,
  maintainAspectRatio: false,
  tooltips: {
  enabled: true,
  mode: 'index',
  position: 'cursor'
  },
  scales: {
    xAxes: [{
      gridLines: {
        color: 'rgba(230,230,230,0.5)',
        lineWidth: 0.2
      },
      ticks: {
        minRotation: 0,
        maxRotation: 300,
        autoSkip: false,
        fontColor: '#23527c'
      },
    }],
    yAxes: [{
      ticks: {
        beginAtZero: true
      },
      gridLines: {
        color: 'rgba(171,171,171,0.5)',
        lineWidth: 0.5
      }
    }]
  },
  plugins: {
    datalabels: {
      display: false
    },
    tooltip: {
      enabled: true,
      position: 'cursor'
    }
  }
};

@Component({
  selector: 'laji-observation-month-day-chart',
  templateUrl: './observation-month-day-chart.component.html',
  styleUrls: ['./observation-month-day-chart.component.scss'],
  providers: [LabelPipe, ObservationMonthDayChartFacade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObservationMonthDayChartComponent implements OnChanges, OnDestroy, OnInit {
  private unsubscribe$ = new Subject<void>();
  @Input() query: WarehouseQueryInterface;
  @Input() useIndividualCount = false;
  @Output() hasData = new EventEmitter<boolean>();

  chartData: ChartData;
  yearChartLabels = this.getYearChartLabels();
  monthChartLabels = [];
  barChartOptions = BAR_CHART_OPTIONS;
  activeMonthIdx: number;
  monthFormatting = this.getMonthLabel.bind(this);

  constructor(
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private facade: ObservationMonthDayChartFacade
  ) { }

  ngOnInit() {
    (Tooltip.positioners as any).cursor = (_, coords) => coords;
    this.facade.chartData$.pipe(takeUntil(this.unsubscribe$)).subscribe(chartData => {
      this.chartData = chartData;
      this.cdr.markForCheck();
      this.hasData.emit(true);
    });
  }

  ngOnChanges(c: SimpleChanges) {
    this.facade.loadChartData(this.query, this.useIndividualCount);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onYearChartBarClick({ index }) {
    this.activeMonthIdx = index;
    this.monthChartLabels = this.getMonthChartLabels(index);
  }

  private getYearChartLabels(): string[] {
    const data = [];
    for (let i = 1; i < 13; i++) {
      data.push(this.getMonthLabel(i));
    }
    return data;
  }

  private getMonthChartLabels(monthIdx: number): string[] {
    const days = [];
    for (let i = 0; i < getNbrOfDaysInMonth(monthIdx); i++) {
      days[i] = i + 1;
    }
    return days;
  }

  private getMonthLabel(month: number): string {
    return this.translate.instant('m-' + (month < 10 ? '0' : '') + month);
  }
}
