
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

import { LineChartComponent } from '@swimlane/ngx-charts';

@Component({
  selector: 'laji-line-chart-with-points',
  templateUrl: './line-chart-with-points.component.html',
  styleUrls: ['./line-chart-with-points.component.scss'],
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
