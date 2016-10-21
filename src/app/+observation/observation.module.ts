import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ObservationComponent, routing } from './index';
import { SharedModule } from '../shared/shared.module';
import { ObservationHeaderComponent } from './header/observation-header.component';
import { ObservationActiveComponent } from './active/observation-active.component';
import { ObservationChartComponent } from './chart/observation-chart.component';
import { ObservationFilterComponent } from './filter/observation-filter.component';
import { ObservationFormComponent } from './form/observation-form.component';
import { ObservationGroupSelectComponent } from './group-select/group-select.component';
import { ObservationMapComponent } from './map/observation-map.component';
import { MultiRadioComponent } from './multi-radio/multi-radio.component';
import { ObservationResultComponent } from './result/observation-result.component';
import { ObservationResultListComponent } from './result-list/observation-result-list.component';
import { MetadataSelectComponent } from '../shared/metadata-select/metadata-select.component';
import { PieChartComponent } from '../shared/chart/pie/pie-chart.component';
import { nvD3 } from 'ng2-nvd3';
import { TypeaheadModule } from 'ng2-bootstrap';
import { SelectModule } from 'ng2-select';
import { ObservationCountComponent } from './count/observation-count.component';
import { DatePickerComponent } from '../shared/datepicker/datepicker.component';
import { ObservationAggregateComponent } from './aggregate/observation-aggregate.component';
import { ObservationDownloadComponent } from './download/observation-download.component';

@NgModule({
  imports: [routing, SharedModule, RouterModule, TypeaheadModule, SelectModule],
  declarations: [ObservationComponent, ObservationHeaderComponent, ObservationActiveComponent,
    ObservationAggregateComponent, ObservationChartComponent,
    ObservationFilterComponent, ObservationFormComponent, ObservationGroupSelectComponent,
    MultiRadioComponent, ObservationResultComponent,
    ObservationResultListComponent, MetadataSelectComponent,
    PieChartComponent, nvD3, DatePickerComponent, ObservationDownloadComponent],
  exports: [ObservationCountComponent, ObservationMapComponent]
})
export class ObservationModule {
}
