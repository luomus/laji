import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultsRoutingModule } from './results-routing.module';
import { ResultsComponent } from './results.component';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { KerttuGlobalSharedModule } from '../kerttu-global-shared/shared.module';
import { ChartModule } from '../../../../laji/src/app/shared-modules/chart/chart.module';
import { DatatableModule } from '../../../../laji/src/app/shared-modules/datatable/datatable.module';
import { ValidationPieChartComponent } from './validation-pie-chart/validation-pie-chart.component';
import { UserTableComponent } from './user-table/user-table.component';

@NgModule({
  imports: [
    CommonModule,
    ResultsRoutingModule,
    SharedModule,
    KerttuGlobalSharedModule,
    ChartModule,
    DatatableModule
  ],
  declarations: [ResultsComponent, ValidationPieChartComponent, UserTableComponent]
})
export class ResultsModule { }
