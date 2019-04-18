import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservationTableComponent } from './observation-table/observation-table.component';
import { ObservationListService } from './service/observation-list.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { LangModule } from '../lang/lang.module';
import { SharedModule } from '../../shared/shared.module';
import { DatatableModule } from '../datatable/datatable.module';
import { SelectedFieldGroupComponent } from './selected-field-group/selected-field-group.component';
import { PageSizeSelectComponent } from './page-size-select/page-size-select.component';
import { SelectedFieldItemComponent } from './selected-field-item/selected-field-item.component';
import { ObservationYearChartComponent } from './observation-year-chart/observation-year-chart.component';
import { ObservationMonthDayChartComponent } from './observation-month-day-chart/observation-month-day-chart.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  imports: [
    CommonModule,
    NgxDatatableModule,
    NgxChartsModule,
    LangModule,
    SharedModule,
    DatatableModule
  ],
  declarations: [
    ObservationTableComponent,
    SelectedFieldGroupComponent,
    PageSizeSelectComponent,
    SelectedFieldItemComponent,
    ObservationYearChartComponent,
    ObservationMonthDayChartComponent
  ],
  providers: [ObservationListService],
  exports: [ObservationTableComponent, SelectedFieldGroupComponent, ObservationYearChartComponent, ObservationMonthDayChartComponent]
})
export class ObservationResultModule { }
