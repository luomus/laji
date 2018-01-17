import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { StatisticsComponent } from './statistics.component';
import { LineTransectComponent } from './line-transect/line-transect.component';
import { LineTransectChartComponent } from './line-transect/line-transect-chart/line-transect-chart.component';
import { LajiMapModule } from '../map/laji-map.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    LajiMapModule
  ],
  declarations: [StatisticsComponent, LineTransectComponent, LineTransectChartComponent],
  exports: [StatisticsComponent]
})
export class StatisticsModule { }
