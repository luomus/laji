import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { StatisticsComponent } from './statistics.component';
import { LineTransectComponent } from './line-transect/line-transect.component';
import { LineTransectChartComponent } from './line-transect/line-transect-chart/line-transect-chart.component';
import { LajiMapModule } from '@laji-map/laji-map.module';
import { AcceptedDocumentApprovalComponent } from './common/accepted-document-approval/accepted-document-approval.component';
import { BirdPointCountStatsComponent } from './bird-point-count-stats/bird-point-count-stats.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    LajiMapModule
  ],
  declarations: [StatisticsComponent, LineTransectComponent, LineTransectChartComponent, AcceptedDocumentApprovalComponent, BirdPointCountStatsComponent],
  exports: [StatisticsComponent, LineTransectChartComponent]
})
export class StatisticsModule { }
