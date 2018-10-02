import {
  Component,
  Input,
  ViewEncapsulation,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewChild,
  HostListener,
  OnInit,
  OnChanges,
  ContentChild,
  TemplateRef
} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

import {
  NgxChartsModule, BaseChartComponent, LineSeriesComponent,
  calculateViewDimensions, ViewDimensions, ColorHelper
} from '@swimlane/ngx-charts';
import { area, line, curveLinear } from 'd3-shape';
import { scaleBand, scaleLinear, scalePoint, scaleTime } from 'd3-scale';

@Component({
  selector: 'laji-line-chart-with-points',
  templateUrl: './line-chart-with-points.component.html',
  styleUrls: ['./line-chart-with-points.component.css']
})
export class LineChartWithPointsComponent extends BaseChartComponent  {
  @Input() data: any;

  colorScheme = {
    domain: ['steelblue']
  };
}
