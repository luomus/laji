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
import { TaxonYearChartComponent } from './taxon-year-chart/taxon-year-chart.component';
import { TaxonMonthDayChartComponent } from './taxon-month-day-chart/taxon-month-day-chart.component';
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
    TaxonYearChartComponent,
    TaxonMonthDayChartComponent
  ],
  providers: [ObservationListService],
  exports: [ObservationTableComponent, SelectedFieldGroupComponent, TaxonYearChartComponent, TaxonMonthDayChartComponent]
})
export class ObservationResultModule { }
