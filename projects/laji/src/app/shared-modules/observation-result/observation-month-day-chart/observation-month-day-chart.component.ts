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
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChartOptions, Tooltip } from 'chart.js';
import { LabelPipe } from '../../../shared/pipe/label.pipe';
import { ChartData, ObservationMonthDayChartFacade, getNbrOfDaysInMonth } from './observation-month-day-chart.facade';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModalComponent } from 'projects/laji-ui/src/lib/modal/modal/modal.component';

const tooltipPosition = 'cursor' as any; // chart.js typings broken for custom tooltip position so we define it as 'any'.
const BAR_CHART_OPTIONS: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: {
        color: 'rgba(230,230,230,0.5)',
        lineWidth: 0.2
      },
      ticks: {
        minRotation: 0,
        maxRotation: 300,
        autoSkip: false,
        color: '#23527c'
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(171,171,171,0.5)',
        lineWidth: 0.5
      }
    }
  },
  plugins: {
    tooltip: {
      enabled: true,
      mode: 'index',
      position: tooltipPosition
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

  @ViewChild('modal', { static: true }) public modal!: ModalComponent;
  @Input() query!: WarehouseQueryInterface;
  @Input() useIndividualCount = false;
  @Output() hasData = new EventEmitter<boolean>();

  chartData?: ChartData;
  yearChartLabels = this.getYearChartLabels();
  monthChartLabels: string[] = [];
  barChartOptions = BAR_CHART_OPTIONS;
  activeMonthIdx?: number;
  monthFormatting = this.getMonthLabel.bind(this);

  constructor(
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private facade: ObservationMonthDayChartFacade
  ) { }

  ngOnInit() {
    (Tooltip.positioners as any).cursor = (_: any, coords: any) => coords;
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

  onYearChartBarClick({ index }: { index: number }) {
    this.activeMonthIdx = index;
    this.monthChartLabels = this.getMonthChartLabels(index).map(l => l + '');
    this.modal.show();
  }

  private getYearChartLabels(): string[] {
    const data = [];
    for (let i = 1; i < 13; i++) {
      data.push(this.getMonthLabel(i));
    }
    return data;
  }

  private getMonthChartLabels(monthIdx: number): number[] {
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
