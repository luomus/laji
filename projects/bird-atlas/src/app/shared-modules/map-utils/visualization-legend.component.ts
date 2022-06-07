import { Component, Input } from '@angular/core';
import { activityCategoryGradient, speciesCountGradient, VisualizationMode } from './visualization-mode';

const speciesCountLegendLabels = [
  '1-49 lajia',
  '50-99 lajia',
  '100-149 lajia',
  '150+ lajia',
];
const activityCategoryLegendLabels = [
  'Ei havaintoja',
  'Satunnaishavaintoja',
  'Välttävä',
  'Tyydyttävä',
  'Hyvä',
  'Erinomainen'
];
const legends: Record<VisualizationMode, { color: string; label: string }[]> = {
  speciesCount: Object.entries(speciesCountGradient).map(([key, val]) => ({
    color: val,
    label: speciesCountLegendLabels[key]
  })),
  activityCategory: Object.entries(activityCategoryGradient).map(([key, val]) => ({
    color: val,
    label: activityCategoryLegendLabels[key]
  }))
};

@Component({
  selector: 'ba-visualization-legend',
  template: `
    <div class="legend-row" *ngFor="let row of legends[visualization]">
      <span class="legend-sq" [ngStyle]="{'background-color': '#' + row.color}"></span>{{ row.label }}
    </div>
  `,
  styleUrls: ['./visualization-legend.component.scss']
})
export class VisualizationLegendComponent {
  @Input() visualization: VisualizationMode;
  legends = legends;
}
