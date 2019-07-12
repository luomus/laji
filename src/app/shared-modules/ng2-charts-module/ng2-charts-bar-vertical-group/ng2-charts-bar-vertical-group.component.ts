import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'laji-canvas',
  template: `<canvas baseChart
  [datasets]="datasets"
  [labels]="labels"
  [options]="options"
  [plugins]="chartType"
  [legend]="legend"
  [chartType]="chartType">
  </canvas>`
})
export class LajiBarComponent {
  @Input() datasets: any;
  @Input() labels: any;
  @Input() options: any;
  @Input() chartType: any;
  @Input() legend: any;

  @Output() chartClick = new EventEmitter();
}
