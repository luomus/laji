import { Component, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import {
  trigger,
  style,
  animate,
  transition
} from '@angular/animations';

import { LineChartComponent } from '@swimlane/ngx-charts';

@Component({
  selector: 'laji-line-chart-with-points',
  templateUrl: './line-chart-with-points.component.html',
  styleUrls: ['../../../../../../../../node_modules/@swimlane/ngx-charts/release/common/base-chart.component.css'],
  /* tslint:disable:use-view-encapsulation */
  encapsulation: ViewEncapsulation.None,
  /* tslint:enable:use-view-encapsulation */
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('animationState', [
      transition(':leave', [
        style({
          opacity: 1,
        }),
        animate(500, style({
          opacity: 0
        }))
      ])
    ])
  ]
})
export class LineChartWithPointsComponent extends LineChartComponent {
}
