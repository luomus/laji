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
  @Input() showGridLines: any;
  @Input() xAxisLabel: any;
  @Input() yAxisLabel: any;
  @Input() xScaleMax: any;
  @Input() xScaleMin: any;
  @Input() yScaleMax: any;
  @Input() yScaleMin: any;
  @Input() xAxisTickFormatting: any;

  width: any;
  height: any;
  tooltipDisabled: any;
  legendOptions: any;
  activeEntries: any;
  clipPathId: any;
  dims: any;
  transform: any;
  clipPath: any;
  trackBy: any;
  timeline: any;
  scaleType: any;
  onClick: any;
  onActivate: any;
  onDeactivate: any;

}
