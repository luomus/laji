import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewChild, Inject } from '@angular/core';
import { BaseChartDirective, Color, Label, PluginServiceGlobalRegistrationAndOptions, SingleOrMultiDataSet } from 'ng2-charts';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { WINDOW } from '@ng-toolkit/universal';
import 'chartjs-chart-treemap/dist/chartjs-chart-treemap.js';

@Component({
  selector: 'laji-chart',
  template: `
    <canvas #myCanvas *lajiBrowserOnly baseChart
            [data]="data"
            [colors]="colors"
            [datasets]="datasets"
            [labels]="labels"
            [options]="options"
            [legend]="legend"
            [chartType]="chartType"
            [plugins]="plugins"
            (chartClick)="onChartClick($event)"
            (chartHover)="chartHover.emit($event)"
    ></canvas>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent {

  @ViewChild(BaseChartDirective) public barChart: BaseChartDirective;

  @Input() public data: SingleOrMultiDataSet;
  @Input() public datasets: ChartDataSets[];
  @Input() public labels: Label[];
  @Input() public options: ChartOptions = {};
  @Input() public chartType: ChartType;
  @Input() public colors: Color[];
  @Input() public legend: boolean;
  @Input() public plugins: PluginServiceGlobalRegistrationAndOptions[];

  @Output() public barClick: EventEmitter<{ event?: MouseEvent; active?: any[]; index: number}> = new EventEmitter();
  @Output() public chartClick: EventEmitter<{ event?: MouseEvent; active?: any[] }> = new EventEmitter();
  @Output() public chartHover: EventEmitter<{ event: MouseEvent; active: any[] }> = new EventEmitter();

  constructor(
    @Inject(WINDOW) private window: Window
  ) {
  }

  onChartClick(event: { event?: MouseEvent; active?: Record<string, unknown>[] }) {
    this.chartClick.emit(event);
    try {
      this.onBarClick(event);
    } catch (e) { }
  }

  private onBarClick(event: { event?: MouseEvent; active?: Record<string, unknown>[] }) {
    const chart = this.barChart.chart;
    const scale = (chart as any).scales['x-axis-0'];
    const width = scale.width;
    const legendHeight = (chart as any).legend.height;
    const off = this.barChart.chart.canvas.getBoundingClientRect().top; // Offset top from chart to top screen
    const offset = Math.abs(off + this.windowVerticalOffset); // total offset from chart to top page

    if (event.event.pageY > offset + legendHeight ) {
      // control if the point where i'm clicking is inside the chart but outside the legend block
      const scales = (chart as any).scales;
      const count = scales['x-axis-0'].ticks.length;
      const paddingLeft = scales['x-axis-0'].paddingLeft;
      const paddingRight = scales['x-axis-0'].paddingRight;
      const xwidth = ( width - paddingLeft - paddingRight ) / count;
      const barIdx = Math.floor(
        (event.event.offsetX - paddingLeft - scales['y-axis-0'].width) / xwidth // Calculate index
      );

      if (barIdx >= 0 && barIdx < count) {
        this.barClick.emit({...event, index: barIdx});
      }
    }
  }

  private get windowVerticalOffset(): number {
    return this.window.pageYOffset
      || this.window.document.documentElement.scrollTop
      || this.window.document.body.scrollTop || 0;
  }
}
