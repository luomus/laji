/* tslint:disable:component-selector */
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ngx-charts-advanced-pie-chart',
  template: ''
})
export class NgxChartsAdvancedPieChartComponent {

  @Input() view: any;
  @Input() results: any;
  @Input() label: any;
  @Input() legend: any;
  @Input() valueFormatting: any;
  @Input() doughnut: any;
  @Input() gradient: any;
  @Input() scheme: any;

  @Output() select = new EventEmitter();

  constructor() { }

}
