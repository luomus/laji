import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';


@Component({
  selector: 'laji-bar-chart',
  template: `
    <canvas *lajiBrowserOnly #mycanvas="base-chart" baseChart
      [datasets]="datasets"
      [labels]="labels"
      [colors]="colors"
      [options]="options"
      [plugins]="chartType"
      [legend]="legend"
      [chartType]="chartType"
      (chartClick)="onClick($event)"
    ></canvas>`,
  styles: [':host { display: block;}']
})
export class BarChartComponent implements OnInit {
  @ViewChild('mycanvas', { static: true }) baseChartComponent: BaseChartDirective;
  @Input() datasets: any;
  @Input() labels: any;
  @Input() options: any;
  @Input() chartType: any;
  @Input() legend: any;
  @Input() colors: any;

  @Output() chartClick = new EventEmitter<any>();

  constructor(
    public elm: ElementRef<HTMLCanvasElement>
    ) {}

  initActiveClickAreas = false;

  ngOnInit() {
  }

  onClick(event) {
    if (!this.initActiveClickAreas) {
      // TODO init active areas
    }
    // if ( click in active area) {
        // return labelClick.emit(value)
    // }
    this.chartClick.emit(event);
  }

}
