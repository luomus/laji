/* tslint:disable:component-selector */
import { Component, Input } from '@angular/core';

@Component({
  selector: 'ngx-charts-line-chart',
  template: '',
})
export class NgxChartsLineChartComponent {

  @Input() view: any;
  @Input() results: any;
  @Input() scheme: any;
  @Input() animations: any;
  @Input() xAxis: any;
  @Input() yAxis: any;
  @Input() legend: any;
  @Input() showXAxisLabel: any;
  @Input() showYAxisLabel: any;
  @Input() xAxisLabel: any;
  @Input() yAxisLabel: any;

}
