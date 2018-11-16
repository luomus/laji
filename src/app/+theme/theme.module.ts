/* tslint:disable:max-line-length */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThemeRoutingModule } from './theme-routing.module';
import { NafiComponent } from './nafi/nafi.component';
import { HerpetologyComponent } from './herpetology/herpetology.component';
import { SharedModule } from '../shared/shared.module';
import { ThemeResultComponent } from './theme-result/theme-result.component';
import { NafiResultComponent } from './nafi/nafi-result/nafi-result.component';
import { ResultService } from './service/result.service';
import { FixedTableDirective } from './directive/fixed-table.directive';
import { ThemeObservationListComponent } from './theme-observation-list/theme-observation-list.component';
import { NafiFormComponent } from './nafi/nafi-form/nafi-form.component';
import { NafiMyDocumentListComponent } from './nafi/nafi-my-document-list/nafi-my-document-list.component';
import { ThemeMyDocumentListComponent } from './theme-my-document-list/theme-my-document-list.component';
import { NafiInstructionsComponent } from './nafi/nafi-instructions/nafi-instructions.component';
import { DocumentViewerModule } from '../shared-modules/document-viewer/document-viewer.module';
import { YkjComponent } from './ykj/ykj.component';
import { EmkComponent } from './emk/emk.component';
import { WbcComponent } from './wbc/wbc.component';
import { WbcFormComponent } from './wbc/wbc-form/wbc-form.component';
import { WbcResultComponent } from './wbc/wbc-result/wbc-result.component';
import { WbcInstructionsComponent } from './wbc/wbc-instructions/wbc-instructions.component';
import { LangModule } from '../shared-modules/lang/lang.module';
import { YkjModule } from '../shared-modules/ykj/ykj.module';
import { ObservationResultModule } from '../shared-modules/observation-result/observation-result.module';
import { OwnSubmissionsModule } from '../shared-modules/own-submissions/own-submissions.module';
import { WbcOwnSubmissionsComponent } from './wbc/wbc-own-submissions/wbc-own-submissions.component';
import { IdentifyComponent } from './identify/identify.component';
import { NafiTemplatesComponent } from './nafi/nafi-templates/nafi-templates.component';
import { NamedPlaceModule } from '../shared-modules/named-place/named-place.module';
import { ThemeComponent } from './theme.component';
import { LineTransectComponent } from './line-transect/line-transect.component';
import { LineTransectResultComponent } from './line-transect/line-transect-result/line-transect-result.component';
import { LineTransectResultGridComponent } from './line-transect/line-transect-result/line-transect-result-grid/line-transect-result-grid.component';
import { LineTransectResultChartComponent } from './line-transect/line-transect-result/line-transect-result-chart/line-transect-result-chart.component';
import { LineTransectFormComponent } from './line-transect/line-transect-form/line-transect-form.component';
import { LineTransectInstructionsComponent } from './line-transect/line-transect-instructions/line-transect-instructions.component';
import { LineTransectMyDocumentListComponent } from './line-transect/line-transect-my-document-list/line-transect-my-document-list.component';
import { StatisticsModule } from '../shared-modules/statistics/statistics.module';
import { DatatableModule } from '../shared-modules/datatable/datatable.module'
import { QualityService } from './service/quality.service';
import { QualityComponent } from './quality/quality.component';
import { MostActiveUsersTableComponent } from './quality/most-active-users-table/most-active-users-table.component';
import { AnnotationTableComponent } from './quality/annotation-table/annotation-table.component';
import { QualityFiltersComponent } from './quality/quality-filters/quality-filters.component';
import { TaxonAutocompleteModule } from '../shared-modules/taxon-autocomplete/taxon-autocomplete.module';
import { LineTransectFormEiVakioComponent } from './line-transect/line-transect-form-ei-vakio/line-transect-form-ei-vakio.component';
import { LineTransectFormKartoitusComponent } from './line-transect/line-transect-form-kartoitus/line-transect-form-kartoitus.component';
import { LajiFormModule } from '@laji-form/laji-form.module';
import { ObservationMapModule } from '../shared-modules/observation-map/observation-map.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { InvasiveControlComponent } from './invasive-control/invasive-control.component';
import { InvasiveControlInstructionsComponent } from './invasive-control/invasive-control-instructions/invasive-control-instructions.component';
import { InvasiveControlFormComponent } from './invasive-control/invasive-control-form/invasive-control-form.component';
import { WbcSpeciesComponent } from './wbc/wbc-result/wbc-species/wbc-species.component';
import { WbcRoutesComponent } from './wbc/wbc-result/wbc-routes/wbc-routes.component';
import { WbcCensusesComponent } from './wbc/wbc-result/wbc-censuses/wbc-censuses.component';
import { WbcSpeciesListComponent } from './wbc/wbc-result/wbc-species/wbc-species-list/wbc-species-list.component';
import { WbcResultService } from './wbc/wbc-result/wbc-result.service';
import { JWBootstrapSwitchModule } from 'jw-bootstrap-switch-ng2';
import { WbcResultFiltersComponent } from './wbc/wbc-result/wbc-result-filters/wbc-result-filters.component';
import { WbcSpeciesChartsComponent } from './wbc/wbc-result/wbc-species-charts/wbc-species-charts.component';
import { WbcSpeciesMapsComponent } from './wbc/wbc-result/wbc-species-charts/wbc-species-maps/wbc-species-maps.component';
import { WbcSpeciesLinechartsComponent } from './wbc/wbc-result/wbc-species-charts/wbc-species-linecharts/wbc-species-linecharts.component';
import { LineChartWithPointsComponent } from './wbc/wbc-result/wbc-species-charts/wbc-species-linecharts/line-chart-with-points/line-chart-with-points.component';
import { WbcRouteComponent } from './wbc/wbc-result/wbc-route/wbc-route.component';
import { WbcRouteTableComponent } from './wbc/wbc-result/wbc-route-table/wbc-route-table.component';
import { FormPermissionModule } from '../+haseka/form-permission/form-permission.module';
import { NavigationThumbnailModule } from '../shared-modules/navigation-thumbnail/navigation-thumbnail.module';
import { LatestDocumentsModule } from '../shared-modules/latest-documents/latest-documents.module';
import { WbcTableFilterComponent } from './wbc/wbc-result/wbc-table-filter/wbc-table-filter.component';
import { WbcRoutesListComponent } from './wbc/wbc-result/wbc-routes/wbc-routes-list/wbc-routes-list.component';
import { WbcRoutesMapComponent } from './wbc/wbc-result/wbc-routes/wbc-routes-map/wbc-routes-map.component';
import { SidebarComponent } from './common/sidebar.component';
import { MonitoringThemeBaseComponent } from './common/monitoring-theme-base.component';
import { InvasiveControlContainerComponent } from './invasive-control/invasive-control.container';

/* tslint:enable:max-line-length */

@NgModule({
  imports: [
    CommonModule,
    ThemeRoutingModule,
    SharedModule,
    DocumentViewerModule,
    LangModule,
    YkjModule,
    ObservationResultModule,
    OwnSubmissionsModule,
    NamedPlaceModule,
    StatisticsModule,
    DatatableModule,
    TaxonAutocompleteModule,
    LajiFormModule,
    ObservationMapModule,
    NgxChartsModule,
    JWBootstrapSwitchModule,
    FormPermissionModule,
    NavigationThumbnailModule,
    LatestDocumentsModule
  ],
  declarations: [
    NafiComponent,
    HerpetologyComponent,
    ThemeResultComponent,
    NafiResultComponent,
    FixedTableDirective,
    ThemeObservationListComponent,
    NafiFormComponent,
    NafiMyDocumentListComponent,
    ThemeMyDocumentListComponent,
    NafiInstructionsComponent,
    YkjComponent,
    EmkComponent,
    WbcComponent,
    WbcFormComponent,
    WbcResultComponent,
    WbcInstructionsComponent,
    WbcOwnSubmissionsComponent,
    LineTransectComponent,
    LineTransectResultComponent,
    LineTransectResultGridComponent,
    LineTransectResultChartComponent,
    LineTransectFormComponent,
    LineTransectInstructionsComponent,
    LineTransectMyDocumentListComponent,
    IdentifyComponent,
    NafiTemplatesComponent,
    ThemeComponent,
    QualityComponent,
    MostActiveUsersTableComponent,
    AnnotationTableComponent,
    QualityFiltersComponent,
    LineTransectFormEiVakioComponent,
    LineTransectFormKartoitusComponent,
    InvasiveControlContainerComponent,
    InvasiveControlComponent,
    InvasiveControlInstructionsComponent,
    InvasiveControlFormComponent,
    WbcSpeciesComponent,
    WbcRoutesComponent,
    WbcCensusesComponent,
    WbcSpeciesListComponent,
    WbcResultFiltersComponent,
    WbcSpeciesChartsComponent,
    WbcSpeciesMapsComponent,
    WbcSpeciesLinechartsComponent,
    LineChartWithPointsComponent,
    WbcRouteComponent,
    WbcRouteTableComponent,
    WbcTableFilterComponent,
    WbcRoutesListComponent,
    WbcRoutesMapComponent,
    SidebarComponent,
    MonitoringThemeBaseComponent
  ],
  providers: [ ResultService, QualityService, WbcResultService ]
})
export class ThemeModule { }
