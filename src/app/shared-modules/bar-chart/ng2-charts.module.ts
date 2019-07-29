import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { ChartsModule } from 'ng2-charts';

@NgModule({
  imports: [
    CommonModule,
    ChartsModule
  ],
  declarations: [BarChartComponent],
  exports: [BarChartComponent]
})
export class ChartsModuleBarVerticalGroup { }


