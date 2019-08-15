import { Component, Input, Output, EventEmitter, ViewChild, OnInit } from '@angular/core';
import { BaseChartComponent } from '@swimlane/ngx-charts';


@Component({
  selector: 'laji-bar-chart',
  template: `<canvas #chart="base-chart"  id="myChart" baseChart
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
export class BarChartComponent implements OnInit {
  @ViewChild('chart', { static: true }) baseChartComponent: BaseChartComponent;
  @Input() datasets: any;
  @Input() labels: any;
  @Input() options: any;
  @Input() chartType: any;
  @Input() legend: any;
  @Input() colors: any;

  @Output() chartClick = new EventEmitter<any>();

  ngOnInit() {
    console.log(this.baseChartComponent);
  }
}
