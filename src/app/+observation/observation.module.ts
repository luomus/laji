import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ObservationActiveComponent } from './active/observation-active.component';
import { ObservationChartComponent } from './chart/observation-chart.component';
import { ObservationFormComponent } from './form/observation-form.component';
import { ObservationGroupSelectComponent } from './group-select/group-select.component';
import { MultiRadioComponent } from './multi-radio/multi-radio.component';
import { ObservationResultComponent } from './result/observation-result.component';
import { ObservationResultListComponent } from './result-list/observation-result-list.component';
import { MetadataSelectComponent } from './metadata-select/metadata-select.component';
import { PieChartComponent } from './chart/pie/pie-chart.component';
import { TypeaheadModule } from 'ngx-bootstrap';
import { DatePickerComponent } from './datepicker/datepicker.component';
import { ObservationDownloadComponent } from './download/observation-download.component';
import { routing } from './observation.routes';
import { ObservationComponent } from './observation.component';
import { ViewerModule } from '../+viewer/viewer.module';
import { NvD3Module } from '../ng2-nvd3/ng2-nvd3.module';
import { SelectComponent } from './select/select.component';
import { YkjModule } from '../shared-modules/ykj/ykj.module';
import { MainResultComponent } from './main-result/main-result.component';
import { ObservationResultModule } from '../shared-modules/observation-result/observation-result.module';
import { ObservationFiltersComponent } from './observation-filters/observation-filters.component';
import { PillListComponent } from './pill-list/pill-list.component';

@NgModule({
  imports: [
    routing,
    NvD3Module,
    SharedModule,
    TypeaheadModule,
    ViewerModule,
    YkjModule,
    NgxDatatableModule,
    ObservationResultModule
  ],
  declarations: [ObservationComponent, ObservationActiveComponent, ObservationChartComponent,
    ObservationFormComponent,
    MultiRadioComponent, ObservationResultComponent,
    ObservationResultListComponent, MetadataSelectComponent,
    PieChartComponent, DatePickerComponent, ObservationDownloadComponent, SelectComponent, MainResultComponent, ObservationFiltersComponent, PillListComponent
  ]
})
export class ObservationModule {
}
