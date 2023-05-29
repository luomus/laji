import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { ActivityCategoryStats } from 'projects/bird-atlas/src/app/core/atlas-api.service';
import { legends } from 'projects/bird-atlas/src/app/shared-modules/map-utils/visualization-legend.component';

type AugmentedLegend = {
  color: string;
  label: string;
  countString?: string;
}[];


// Augments the activity category legend with counts and displays it as a table
@Component({
  selector: 'ba-grid-index-map-table',
  template: `
<table>
  <tr>
    <th>Väri</th>
    <th>Ruutuja (%)</th>
    <th>Selvitysaste</th>
  </tr>
  <tr *ngFor="let row of legend">
    <td><span class="legend-sq" [ngStyle]="{'background-color': '#' + row.color}"></span></td>
    <td style="text-align: right">{{ row.countString ? row.countString : '-' }}</td>
    <td>{{ row.label }}</td>
  </tr>
</table>
`,
  styleUrls: ['../../../../shared-modules/map-utils/visualization-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridIndexMapTableComponent implements OnChanges {
  @Input() activityCategoryStats: ActivityCategoryStats;

  legend: AugmentedLegend = legends['activityCategory'];

  ngOnChanges() {
    Object.values(this.activityCategoryStats).forEach((s, i) => {
      this.legend[i].countString = s.squareSum + ` (${Math.round(s.squarePercentage)} %)`;
    });
  }
}
