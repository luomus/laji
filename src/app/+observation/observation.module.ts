import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ObservationChartComponent } from './chart/observation-chart.component';
import { ObservationViewComponent } from './view/observation-view.component';
import { MultiRadioComponent } from './multi-radio/multi-radio.component';
import { ObservationResultComponent } from './result/observation-result.component';
import { ObservationResultListComponent } from './result-list/observation-result-list.component';
import { PieChartComponent } from './chart/pie/pie-chart.component';
import { TypeaheadModule } from 'ngx-bootstrap';
import { ObservationDownloadComponent } from './download/observation-download.component';
import { routing } from './observation.routes';
import { ObservationComponent } from './observation.component';
import { ViewerModule } from '../+viewer/viewer.module';
import { YkjModule } from '../shared-modules/ykj/ykj.module';
import { MainResultComponent } from './main-result/main-result.component';
import { ObservationResultModule } from '../shared-modules/observation-result/observation-result.module';
import { SearchFiltersModule } from '../shared-modules/search-filters/search-filters.module';
import { ObservationFiltersComponent } from './observation-filters/observation-filters.component';
import { PillListComponent } from './pill-list/pill-list.component';
import { LajiSelectModule } from '../shared-modules/select/select.module';
import { InfoModule } from '../shared-modules/info/info.module';
import { ObservationMapModule } from '../shared-modules/observation-map/observation-map.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ObservationFormComponent } from './form/observation-form.component';
import { SeasonComponent } from './form/season/season.component';
import { ResetComponent } from './reset/reset.component';
import { JWBootstrapSwitchModule } from 'jw-bootstrap-switch-ng2';
import { ThreeStateSwitchComponent } from './form/three-state-switch/three-state-switch.component';
import { ThreeStateMultiSwitchComponent } from './form/three-state-multi-switch/three-state-multi-switch.component';
import { SwitchRowComponent } from './form/three-state-multi-switch/switch-row/switch-row.component';
import { IndeterminateCheckboxComponent } from './form/three-state-multi-switch/switch-row/indeterminate-checkbox/indeterminate-checkbox.component';
import { TeamComponent } from './form/team/team.component';
import { MemberIdPillListComponent } from './form/team/member-id-pill-list/member-id-pill-list.component';

@NgModule({
  imports: [
    routing,
    SharedModule,
    TypeaheadModule,
    ViewerModule,
    YkjModule,
    NgxDatatableModule,
    ObservationResultModule,
    SearchFiltersModule,
    LajiSelectModule,
    ObservationMapModule,
    InfoModule,
    NgxChartsModule,
    JWBootstrapSwitchModule
  ],
  declarations: [ObservationComponent, ObservationChartComponent,
    ObservationViewComponent,
    ResetComponent,
    MultiRadioComponent, ObservationResultComponent,
    ObservationResultListComponent,
    PieChartComponent, ObservationDownloadComponent, MainResultComponent, ObservationFiltersComponent,
    PillListComponent,
    ObservationFormComponent,
    SeasonComponent,
    ThreeStateSwitchComponent,
    ThreeStateMultiSwitchComponent,
    SwitchRowComponent,
    IndeterminateCheckboxComponent,
    TeamComponent,
    MemberIdPillListComponent
  ]
})
export class ObservationModule {
}
