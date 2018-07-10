/* tslint:disable:component-selector */
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ngx-charts-pie-chart',
  template: ''
})
export class NgxChartsPieChartComponent {
  @Input() view: any;
  @Input() legendTitle: any;
  @Input() results: any;
  @Input() labels: any;
  @Input() legend: any;
  @Input() doughnut: any;
  @Input() gradient: any;

  @Output() select = new EventEmitter();
}
