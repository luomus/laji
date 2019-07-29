import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'laji-bar-chart',
  template: `<canvas id="myChart" baseChart
  [datasets]="datasets"
  [labels]="labels"
  [colors]="colors"
  [options]="options"
  [plugins]="chartType"
  [legend]="legend"
  [chartType]="chartType"
  (chartClick)="chartClick.emit($event)"
  >
  </canvas>`,
  styles: [':host { display:block; height:350px }']
})
export class BarChartComponent {
  @Input() datasets: any;
  @Input() labels: any;
  @Input() options: any;
  @Input() chartType: any;
  @Input() legend: any;
  @Input() colors: any;

  @Output() chartClick = new EventEmitter<any>();
}
