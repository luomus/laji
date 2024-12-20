import { Component, Input } from '@angular/core';
import { activityCategoryGradient, speciesCountGradient, VisualizationMode, visualizationModeTitles } from './visualization-mode';

const speciesCountLegendLabels = [
  '0-24 lajia',
  '25-49 lajia',
  '50-74 lajia',
  '75-99 lajia',
  '100-124 lajia',
  '125+ lajia',
];
const activityCategoryLegendLabels = [
  'Ei havaintoja',
  'Satunnaishavaintoja',
  'Välttävä',
  'Tyydyttävä',
  'Hyvä',
  'Erinomainen'
];
export const legends: Record<VisualizationMode, { color: string; label: string }[]> = {
  speciesCount: Object.entries(speciesCountGradient).map(([key, val]) => ({
    color: val,
    label: speciesCountLegendLabels[<number><unknown>key]
  })),
  activityCategory: Object.entries(activityCategoryGradient).map(([key, val]) => ({
    color: val,
    label: activityCategoryLegendLabels[<number><unknown>key]
  }))
};

@Component({
  selector: 'ba-visualization-legend',
  template: `
    <h6>{{ visualizationModeTitles[visualization] }}</h6>
    <div class="legend-row" *ngFor="let row of legends[visualization]">
      <span class="legend-sq" [ngStyle]="{'background-color': '#' + row.color}"></span>{{ row.label }}
    </div>
  `,
  styleUrls: ['./visualization-legend.component.scss']
})
export class VisualizationLegendComponent {
  @Input() visualization!: VisualizationMode;
  legends = legends;
  visualizationModeTitles = visualizationModeTitles;
}
