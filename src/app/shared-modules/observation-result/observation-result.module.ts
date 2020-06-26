import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservationTableComponent } from './observation-table/observation-table.component';
import { ObservationTableOwnDocumentsComponent } from './observation-table-own-documents/observation-table-own-documents.component';
import { ObservationResultService } from './service/observation-result.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { LangModule } from '../lang/lang.module';
import { SharedModule } from '../../shared/shared.module';
import { DatatableModule } from '../datatable/datatable.module';
import { SelectedFieldGroupComponent } from './selected-field-group/selected-field-group.component';
import { PageSizeSelectComponent } from './page-size-select/page-size-select.component';
import { SelectedFieldItemComponent } from './selected-field-item/selected-field-item.component';
import { ObservationYearChartComponent } from './observation-year-chart/observation-year-chart.component';
import { ObservationMonthDayChartComponent } from './observation-month-day-chart/observation-month-day-chart.component';
import { ObservationTableSettingsComponent } from './observation-table/observation-table-settings.component';
import { LajiUiModule } from '../../../../projects/laji-ui/src/lib/laji-ui.module';
import { ChartModule } from '../chart/chart.module';

@NgModule({
  imports: [
    CommonModule,
    NgxDatatableModule,
    LangModule,
    SharedModule,
    DatatableModule,
    LajiUiModule,
    ChartModule
  ],
  declarations: [
    ObservationTableComponent,
    SelectedFieldGroupComponent,
    PageSizeSelectComponent,
    SelectedFieldItemComponent,
    ObservationYearChartComponent,
    ObservationMonthDayChartComponent,
    ObservationTableSettingsComponent,
    ObservationTableOwnDocumentsComponent
  ],
  providers: [ObservationResultService],
  exports: [
    ObservationTableComponent,
    ObservationTableSettingsComponent,
    SelectedFieldGroupComponent,
    ObservationYearChartComponent,
    ObservationMonthDayChartComponent,
    ObservationTableOwnDocumentsComponent
  ]
})
export class ObservationResultModule { }
