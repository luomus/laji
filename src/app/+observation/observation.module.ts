import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ObservationActiveComponent } from './active/observation-active.component';
import { ObservationChartComponent } from './chart/observation-chart.component';
import { ObservationFilterComponent } from './filter/observation-filter.component';
import { ObservationFormComponent } from './form/observation-form.component';
import { ObservationGroupSelectComponent } from './group-select/group-select.component';
import { MultiRadioComponent } from './multi-radio/multi-radio.component';
import { ObservationResultComponent } from './result/observation-result.component';
import { ObservationResultListComponent } from './result-list/observation-result-list.component';
import { MetadataSelectComponent } from './metadata-select/metadata-select.component';
import { PieChartComponent } from './chart/pie/pie-chart.component';
import { TypeaheadModule } from 'ngx-bootstrap';
import { DatePickerComponent } from './datepicker/datepicker.component';
import { ObservationAggregateComponent } from './aggregate/observation-aggregate.component';
import { ObservationDownloadComponent } from './download/observation-download.component';
import { routing } from './observation.routes';
import { ObservationComponent } from './observation.component';
import { ViewerModule } from '../+viewer/viewer.module';
import { NvD3Module } from '../ng2-nvd3/ng2-nvd3.module';
import { MultiselectDropdownModule } from 'angular-2-dropdown-multiselect';
import { SelectComponent } from './select/select.component';

@NgModule({
  imports: [routing, NvD3Module, SharedModule, TypeaheadModule, ViewerModule, MultiselectDropdownModule],
  declarations: [ObservationComponent, ObservationActiveComponent,
    ObservationAggregateComponent, ObservationChartComponent,
    ObservationFilterComponent, ObservationFormComponent, ObservationGroupSelectComponent,
    MultiRadioComponent, ObservationResultComponent,
    ObservationResultListComponent, MetadataSelectComponent,
    PieChartComponent, DatePickerComponent, ObservationDownloadComponent, SelectComponent]
})
export class ObservationModule {
}
