import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ObservationChartComponent } from './chart/observation-chart.component';
import { ObservationViewComponent } from './view/observation-view.component';
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
import { InfoModule } from '../shared-modules/info/info.module';
import { ObservationMapModule } from '../shared-modules/observation-map/observation-map.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ObservationFormComponent } from './form/observation-form.component';
import { SeasonComponent } from './form/season/season.component';
import { ResetComponent } from './reset/reset.component';
import { JWBootstrapSwitchModule } from 'jw-bootstrap-switch-ng2';
import { TeamComponent } from './form/team/team.component';
import { MemberIdPillListComponent } from './form/team/member-id-pill-list/member-id-pill-list.component';
import { RemoveLeadingPipe } from './pipe/remove-leading.pipe';
import { ExistsPipe } from './pipe/exists.pipe';

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
    ObservationMapModule,
    InfoModule,
    NgxChartsModule,
    JWBootstrapSwitchModule
  ],
  declarations: [ObservationComponent, ObservationChartComponent,
    ObservationViewComponent,
    ResetComponent,
    ObservationResultComponent,
    ObservationResultListComponent,
    PieChartComponent, ObservationDownloadComponent, MainResultComponent, ObservationFiltersComponent,
    PillListComponent,
    ObservationFormComponent,
    SeasonComponent,
    TeamComponent,
    MemberIdPillListComponent,
    RemoveLeadingPipe,
    ExistsPipe
  ]
})
export class ObservationModule {
}
