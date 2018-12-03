/* tslint:disable:component-selector max-classes-per-file */
import { Component, Input } from '@angular/core';

@Component({
  selector: 'ngx-charts-chart',
  template: '',
})
export class NgxChartsChartComponent {

  @Input() view: any;
  @Input() results: any;
  @Input() animations: any;
  @Input() legend: any;
  @Input() showLegend: any;
  @Input() legendOptions: any;
  @Input() activeEntries: any;

}

@Component({
  selector: 'g[ngx-charts-x-axis]',
  template: '',
})
export class NgxXAxisComponent {

  @Input() xScale: any;
  @Input() dims: any;
  @Input() showGridLines: any;
  @Input() showLabel: any;
  @Input() labelText: any;
  @Input() tickFormatting: any;
  @Input() ticks: any;

}

@Component({
  selector: 'g[ngx-charts-y-axis]',
  template: '',
})
export class NgxYAxisComponent {

  @Input() yScale: any;
  @Input() dims: any;
  @Input() showGridLines: any;
  @Input() showLabel: any;
  @Input() labelText: any;
  @Input() tickFormatting: any;
  @Input() ticks: any;
  @Input() referenceLines: any;
  @Input() showRefLines: any;
  @Input() showRefLabels: any;

}

@Component({
  selector: 'g[ngx-charts-line-series]',
  template: '',
})
export class NgxLineSeriesComponent {

  @Input() xScale: any;
  @Input() yScale: any;
  @Input() colors: any;
  @Input() data: any;
  @Input() activeEntries: any;
  @Input() scaleType: any;
  @Input() curve: any;
  @Input() rangeFillOpacity: any;
  @Input() hasRange: any;
  @Input() animations: any;

}

@Component({
  selector: 'g[ngx-charts-tooltip-area]',
  template: '',
})
export class NgxTooltipAreaComponent {

  @Input() dims: any;
  @Input() xSet: any;
  @Input() xScale: any;
  @Input() yScale: any;
  @Input() results: any;
  @Input() colors: any;
  @Input() tooltipDisabled: any;
  @Input() tooltipTemplate: any;

}

@Component({
  selector: 'g[ngx-charts-circle-series]',
  template: '',
})
export class NgxCircleSeriesComponent {

  @Input() xScale: any;
  @Input() yScale: any;
  @Input() colors: any;
  @Input() data: any;
  @Input() scaleType: any;
  @Input() visibleValue: any;
  @Input() activeEntries: any;
  @Input() tooltipDisabled: any;
  @Input() tooltipTemplate: any;

}

@Component({
  selector: 'g[ngx-charts-timeline]',
  template: '',
})
export class NgxTimelineComponent {

  @Input() results: any;
  @Input() view: any;
  @Input() height: any;
  @Input() scheme: any;
  @Input() customColors: any;
  @Input() scaleType: any;
  @Input() legend: any;

}
