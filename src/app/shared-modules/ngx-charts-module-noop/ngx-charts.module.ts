import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsLineChartComponent } from './ngx-charts-line-chart/ngx-charts-line-chart.component';
import { NgxChartsPieChartComponent } from './ngx-charts-pie-chart/ngx-charts-pie-chart.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [NgxChartsLineChartComponent, NgxChartsPieChartComponent],
  exports: [NgxChartsLineChartComponent, NgxChartsPieChartComponent]
})
export class NgxChartsModule { }
