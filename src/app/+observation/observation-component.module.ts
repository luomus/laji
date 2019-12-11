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
import { DocumentViewerModule } from '../shared-modules/document-viewer/document-viewer.module';
import { YkjModule } from '../shared-modules/ykj/ykj.module';
import { MainResultComponent } from './main-result/main-result.component';
import { ObservationResultModule } from '../shared-modules/observation-result/observation-result.module';
import { SearchFiltersModule } from '../shared-modules/search-filters/search-filters.module';
import { ObservationFiltersComponent } from './observation-filters/observation-filters.component';
import { PillListComponent } from './pill-list/pill-list.component';
import { InfoModule } from '../shared-modules/info/info.module';
import { ObservationMapModule } from '../shared-modules/observation-map/observation-map.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartsModule } from 'ng2-charts';
import { ObservationFormComponent } from './form/observation-form.component';
import { SeasonComponent } from './form/season/season.component';
import { ResetComponent } from './reset/reset.component';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';
import { TeamComponent } from './form/team/team.component';
import { MemberIdPillListComponent } from './form/team/member-id-pill-list/member-id-pill-list.component';
import { RemoveLeadingPipe } from './pipe/remove-leading.pipe';
import { ExistsPipe } from './pipe/exists.pipe';
import { ToSafeQueryPipe } from './pipe/to-safe-query.pipe';
import { AnnotationsComponent } from './annotations/annotations.component';
import { FormSampleComponent } from './form-sample/form-sample.component';
import { AnnotationModule } from './annotations/annotations.module';
import { LajiUiModule } from '../../../projects/laji-ui/src/public-api';
import { DownloadModule } from '../shared-modules/download/download.module';
import { ChartsModuleBarVerticalGroup } from '../shared-modules/bar-chart/ng2-charts.module';
import { HorizontalChartComponent } from './horizontal-chart/horizontal-chart.component';

@NgModule({
  imports: [
    routing,
    SharedModule,
    TypeaheadModule,
    DocumentViewerModule,
    YkjModule,
    NgxDatatableModule,
    ObservationResultModule,
    SearchFiltersModule,
    ObservationMapModule,
    InfoModule,
    NgxChartsModule,
    ChartsModule,
    JwBootstrapSwitchNg2Module,
    AnnotationModule,
    LajiUiModule,
    DownloadModule,
    ChartsModuleBarVerticalGroup
  ],
  declarations: [
    ObservationComponent,
    ObservationChartComponent,
    ObservationViewComponent,
    ResetComponent,
    ObservationResultComponent,
    ObservationResultListComponent,
    PieChartComponent,
    ObservationDownloadComponent,
    MainResultComponent,
    ObservationFiltersComponent,
    PillListComponent,
    ObservationFormComponent,
    SeasonComponent,
    TeamComponent,
    MemberIdPillListComponent,
    RemoveLeadingPipe,
    ExistsPipe,
    ToSafeQueryPipe,
    AnnotationsComponent,
    FormSampleComponent,
    HorizontalChartComponent
  ],
  exports: [
    ObservationViewComponent
  ]
})
export class ObservationComponentModule {
}
