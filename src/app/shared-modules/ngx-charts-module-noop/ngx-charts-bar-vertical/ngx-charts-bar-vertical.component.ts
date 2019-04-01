/* tslint:disable:component-selector max-classes-per-file */
import { Component, Input } from '@angular/core';

@Component({
  selector: 'ngx-charts-bar-vertical',
  template: ''
})
export class NgxChartsBarVerticalComponent {
  @Input() results: any;
  @Input() xAxis: any;
  @Input() yAxis: any;
  @Input() yAxisTickFormatting: any;
  @Input() xAxisLabel: any;
  @Input() yAxisLabel: any;
  @Input() showXAxisLabel: any;
  @Input() showYAxisLabel: any;
}
