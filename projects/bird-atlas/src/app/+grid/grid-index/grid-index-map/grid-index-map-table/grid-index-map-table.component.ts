import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { legends } from 'projects/bird-atlas/src/app/shared-modules/map-utils/visualization-legend.component';

type AugmentedLegend = {
  color: string;
  label: string;
  count?: number;
}[];


// Augments the activity category legend with counts and displays it as a table
@Component({
  selector: 'ba-grid-index-map-table',
  template: `
<table>
  <tr>
    <th>Väri</th>
    <th>#</th>
    <th>Selvitysaste</th>
  </tr>
  <tr *ngFor="let row of legend">
    <td><span class="legend-sq" [ngStyle]="{'background-color': '#' + row.color}"></span></td>
    <td>{{ row.count ? row.count : '-' }}</td>
    <td>{{ row.label }}</td>
  </tr>
</table>
`,
  styleUrls: ['../../../../shared-modules/map-utils/visualization-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridIndexMapTableComponent implements OnChanges {
  @Input() activityCounts: number[] = [];

  legend: AugmentedLegend = legends['activityCategory'];

  ngOnChanges() {
    this.activityCounts.forEach((v, i) => this.legend[i].count = v);
  }
}
