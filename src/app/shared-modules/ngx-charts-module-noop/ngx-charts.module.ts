import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsLineChartComponent } from './ngx-charts-line-chart/ngx-charts-line-chart.component';
import { NgxChartsPieChartComponent } from './ngx-charts-pie-chart/ngx-charts-pie-chart.component';
import { NgxChartsAdvancedPieChartComponent } from './ngx-charts-advanced-pie-chart/ngx-charts-advanced-pie-chart.component';
import {
  NgxChartsChartComponent,
  NgxXAxisComponent,
  NgxYAxisComponent,
  NgxLineSeriesComponent,
  NgxTooltipAreaComponent,
  NgxCircleSeriesComponent,
  NgxTimelineComponent
} from './ngx-charts-chart/ngx-charts-chart.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [NgxChartsLineChartComponent, NgxChartsPieChartComponent, NgxChartsAdvancedPieChartComponent, NgxChartsChartComponent,
    NgxXAxisComponent, NgxYAxisComponent, NgxLineSeriesComponent, NgxTooltipAreaComponent, NgxCircleSeriesComponent, NgxTimelineComponent],
  exports: [NgxChartsLineChartComponent, NgxChartsPieChartComponent, NgxChartsAdvancedPieChartComponent, NgxChartsChartComponent,
    NgxXAxisComponent, NgxYAxisComponent, NgxLineSeriesComponent, NgxTooltipAreaComponent, NgxCircleSeriesComponent, NgxTimelineComponent]
})
export class NgxChartsModule { }

export { NgxChartsLineChartComponent as LineChartComponent }
