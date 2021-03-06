import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsLineChartComponent } from './ngx-charts-line-chart/ngx-charts-line-chart.component';
import { NgxChartsPieChartComponent } from './ngx-charts-pie-chart/ngx-charts-pie-chart.component';
import { NgxChartsAdvancedPieChartComponent } from './ngx-charts-advanced-pie-chart/ngx-charts-advanced-pie-chart.component';
import {
  NgxChartsChartComponent,
  NgxCircleSeriesComponent,
  NgxLineSeriesComponent,
  NgxTimelineComponent,
  NgxTooltipAreaComponent,
  NgxXAxisComponent,
  NgxYAxisComponent
} from './ngx-charts-chart/ngx-charts-chart.component';
import { NgxChartsTreeMapComponent } from './ngx-charts-tree-map/ngx-charts-tree-map.component';
import { NgxChartsBarVerticalComponent } from './ngx-charts-bar-vertical/ngx-charts-bar-vertical.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [NgxChartsLineChartComponent, NgxChartsPieChartComponent, NgxChartsAdvancedPieChartComponent, NgxChartsChartComponent,
    NgxXAxisComponent, NgxYAxisComponent, NgxLineSeriesComponent, NgxTooltipAreaComponent, NgxCircleSeriesComponent, NgxTimelineComponent,
    NgxChartsTreeMapComponent,
    NgxChartsBarVerticalComponent],
  exports: [NgxChartsLineChartComponent, NgxChartsPieChartComponent, NgxChartsAdvancedPieChartComponent, NgxChartsChartComponent,
    NgxXAxisComponent, NgxYAxisComponent, NgxLineSeriesComponent, NgxTooltipAreaComponent, NgxCircleSeriesComponent, NgxTimelineComponent,
    NgxChartsTreeMapComponent, NgxChartsBarVerticalComponent]
})
export class NgxChartsModule { }

export { NgxChartsLineChartComponent as LineChartComponent };
