import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartType, ChartDataset, ChartEvent, ChartData, Plugin, ChartOptions } from 'chart.js';

@Component({
  selector: 'laji-chart',
  template: `
    <canvas *lajiBrowserOnly baseChart
            [data]="data"
            [datasets]="datasets"
            [labels]="labels"
            [options]="options"
            [legend]="legend"
            [type]="chartType"
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

  @ViewChild(BaseChartDirective) public barChart?: BaseChartDirective;

  @Input() public data?: ChartData;
  @Input() public datasets?: ChartDataset[];
  @Input() public labels?: string[];
  @Input() public options: ChartOptions<any> = {};
  @Input() public chartType?: ChartType;
  @Input() public legend?: boolean;
  @Input() public plugins: Plugin<any, any>[] = [];

  @Output() public barClick: EventEmitter<{ event?: ChartEvent; active?: any[]; index: number}> = new EventEmitter();
  @Output() public chartClick: EventEmitter<{ event?: ChartEvent; active?: any[] }> = new EventEmitter();
  @Output() public chartHover: EventEmitter<{ event: ChartEvent; active: any[] }> = new EventEmitter();

  onChartClick(event: { event?: ChartEvent; active?: object[] }) {
    this.chartClick.emit(event);
    try {
      this.onBarClick(event);
    } catch (e) { }
  }

  private onBarClick(event: { event?: ChartEvent; active?: object[] }) {
    const barIndex = (event.active?.[0] as any)?.index;
    if (barIndex >= 0) {
      this.barClick.emit({...event, index: barIndex});
    }
  }
}
