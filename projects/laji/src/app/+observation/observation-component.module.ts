import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { NgxDatatableModule } from '@achimha/ngx-datatable';
import { ObservationViewComponent } from './view/observation-view.component';
import { ObservationResultComponent } from './result/observation-result.component';
import { ObservationResultListComponent } from './result-list/observation-result-list.component';
import { ObservationDownloadComponent } from './download/observation-download.component';
import { routing } from './observation.routes';
import { ObservationComponent } from './observation.component';
import { DocumentViewerModule } from '../shared-modules/document-viewer/document-viewer.module';
import { YkjModule } from '../shared-modules/ykj/ykj.module';
import { MainResultComponent } from './main-result/main-result.component';
import { ObservationResultModule } from '../shared-modules/observation-result/observation-result.module';
import { SearchFiltersModule } from '../shared-modules/search-filters/search-filters.module';
import { ThreeStateSwitchModule } from '../shared-modules/three-state-switch/three-state-switch.module';
import { ObservationFiltersComponent } from './observation-filters/observation-filters.component';
import { InfoModule } from '../shared-modules/info/info.module';
import { ObservationMapModule } from '../shared-modules/observation-map/observation-map.module';
import { ObservationFormComponent } from './form/observation-form.component';
import { SeasonComponent } from './form/season/season.component';
import { JwBootstrapSwitchNg2Module } from '@servoy/jw-bootstrap-switch-ng2';
import { TeamComponent } from './form/team/team.component';
import { MemberIdPillListComponent } from './form/team/member-id-pill-list/member-id-pill-list.component';
import { RemoveLeadingPipe } from './pipe/remove-leading.pipe';
import { ExistsPipe } from './pipe/exists.pipe';
import { ToSafeQueryPipe } from './pipe/to-safe-query.pipe';
import { FormSampleComponent } from './form-sample/form-sample.component';
import { AnnotationModule } from './annotations/annotations.module';
import { LajiUiModule } from '../../../../laji-ui/src/public-api';
import { DownloadModalModule } from '../shared-modules/download-modal/download-modal.module';
import { HorizontalChartComponent } from './horizontal-chart/horizontal-chart.component';
import { DateFormComponent } from './form/date-form/date-form.component';
import { PillListModule } from '../shared-modules/pill-list/pill-list.module';
import { ChartModule } from '../shared-modules/chart/chart.module';
import { TechnicalNewsModule } from '../shared-modules/technical-news/technical-news.module';
import { InfoPageModule } from '../shared-modules/info-page/info-page.module';
import { SelectModule } from '../shared-modules/select/select.module';
import { CollectionsSelectModule } from '../shared-modules/collections-select/collections-select.module';
import { OwnObservationsFilterComponent } from './form/own-observations-filter/own-observations-filter.component';
import { ExtendedGroupSelectModule } from '../shared-modules/extended-group-select/extended-group-select.module';
import { ConservationFilterComponent } from './form/conservation-filter/conservation-filter.component';
import { CommonModule } from '@angular/common';
import { ObservationResultFrontComponent } from './result-front/observation-result-front.component';
import { TooltipModule } from 'projects/laji-ui/src/lib/tooltip/tooltip.module';
import { TypeaheadModule } from 'projects/laji-ui/src/lib/typeahead/typeahead.module';
import { ModalModule } from 'projects/laji-ui/src/lib/modal/modal.module';
import { ObservationFormMediaFilterComponent } from './form/media-filter/media-filter.component';

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
    JwBootstrapSwitchNg2Module,
    AnnotationModule,
    LajiUiModule,
    DownloadModalModule,
    ChartModule,
    ThreeStateSwitchModule,
    PillListModule,
    TechnicalNewsModule,
    InfoPageModule,
    SelectModule,
    CollectionsSelectModule,
    ExtendedGroupSelectModule,
    CommonModule,
    ModalModule,
    TooltipModule
  ],
  declarations: [
    ObservationComponent,
    ObservationViewComponent,
    ObservationResultComponent,
    ObservationResultListComponent,
    ObservationDownloadComponent,
    MainResultComponent,
    ObservationFiltersComponent,
    ObservationFormComponent,
    SeasonComponent,
    TeamComponent,
    MemberIdPillListComponent,
    RemoveLeadingPipe,
    ExistsPipe,
    ToSafeQueryPipe,
    FormSampleComponent,
    HorizontalChartComponent,
    DateFormComponent,
    OwnObservationsFilterComponent,
    ConservationFilterComponent,
    ObservationResultFrontComponent,
    ObservationFormMediaFilterComponent
  ],
  exports: [
    ObservationViewComponent
  ]
})
export class ObservationComponentModule {
}
