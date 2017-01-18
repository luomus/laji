import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ObservationActiveComponent } from './active/observation-active.component';
import { ObservationChartComponent } from './chart/observation-chart.component';
import { ObservationFilterComponent } from './filter/observation-filter.component';
import { ObservationFormComponent } from './form/observation-form.component';
import { ObservationGroupSelectComponent } from './group-select/group-select.component';
import { MultiRadioComponent } from './multi-radio/multi-radio.component';
import { ObservationResultComponent } from './result/observation-result.component';
import { ObservationResultListComponent } from './result-list/observation-result-list.component';
import { MetadataSelectComponent } from '../shared/metadata-select/metadata-select.component';
import { PieChartComponent } from '../shared/chart/pie/pie-chart.component';
import { TypeaheadModule } from 'ng2-bootstrap';
import { SelectModule } from 'ng2-select/ng2-select';
import { DatePickerComponent } from '../shared/datepicker/datepicker.component';
import { ObservationAggregateComponent } from './aggregate/observation-aggregate.component';
import { ObservationDownloadComponent } from './download/observation-download.component';
import { routing } from './observation.routes';
import { ObservationComponent } from './observation.component';
import { nvD3 } from 'ng2-nvd3';
import { ViewerModule } from '../+viewer/viewer.module';

@NgModule({
  imports: [routing, SharedModule, RouterModule, TypeaheadModule, SelectModule, ViewerModule],
  declarations: [ObservationComponent, ObservationActiveComponent,
    ObservationAggregateComponent, ObservationChartComponent,
    ObservationFilterComponent, ObservationFormComponent, ObservationGroupSelectComponent,
    MultiRadioComponent, ObservationResultComponent,
    ObservationResultListComponent, MetadataSelectComponent,
    PieChartComponent, nvD3, DatePickerComponent, ObservationDownloadComponent]
})
export class ObservationModule {
}
