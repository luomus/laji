/* tslint:disable:max-line-length */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeRoutingModule } from './theme-routing.module';
import { HerpetologyComponent } from './herpetology/herpetology.component';
import { SharedModule } from '../shared/shared.module';
import { ThemeResultComponent } from './theme-result/theme-result.component';
import { NafiResultComponent } from './nafi/nafi-result/nafi-result.component';
import { ResultService } from './service/result.service';
import { ThemeObservationListComponent } from './theme-observation-list/theme-observation-list.component';
import { ThemeMyDocumentListComponent } from './theme-my-document-list/theme-my-document-list.component';
import { DocumentViewerModule } from '../shared-modules/document-viewer/document-viewer.module';
import { YkjComponent } from './ykj/ykj.component';
import { EmkComponent } from './emk/emk.component';
import { WbcResultComponent } from './wbc/wbc-result/wbc-result.component';
import { WbcInstructionsComponent } from './wbc/wbc-instructions/wbc-instructions.component';
import { LangModule } from '../shared-modules/lang/lang.module';
import { YkjModule } from '../shared-modules/ykj/ykj.module';
import { ObservationResultModule } from '../shared-modules/observation-result/observation-result.module';
import { OwnSubmissionsModule } from '../shared-modules/own-submissions/own-submissions.module';
import { IdentifyComponent } from './identify/identify.component';
import { NafiTemplatesComponent } from './nafi/nafi-templates/nafi-templates.component';
import { NamedPlaceModule } from '../shared-modules/named-place/named-place.module';
import { ThemeComponent } from './theme.component';
import { LineTransectResultComponent } from './line-transect/line-transect-result/line-transect-result.component';
import { LineTransectResultGridComponent } from './line-transect/line-transect-result/line-transect-result-grid/line-transect-result-grid.component';
import { LineTransectResultChartComponent } from './line-transect/line-transect-result/line-transect-result-chart/line-transect-result-chart.component';
import { LineTransectInstructionsComponent } from './line-transect/line-transect-instructions/line-transect-instructions.component';
import { StatisticsModule } from '../shared-modules/statistics/statistics.module';
import { DatatableModule } from '../shared-modules/datatable/datatable.module';
import { QualityService } from './service/quality.service';
import { QualityComponent } from './quality/quality.component';
import { MostActiveUsersTableComponent } from './quality/most-active-users-table/most-active-users-table.component';
import { AnnotationTableComponent } from './quality/annotation-table/annotation-table.component';
import { QualityFiltersComponent } from './quality/quality-filters/quality-filters.component';
import { TaxonAutocompleteModule } from '../shared-modules/taxon-autocomplete/taxon-autocomplete.module';
import { LajiFormModule } from '@laji-form/laji-form.module';
import { ObservationMapModule } from '../shared-modules/observation-map/observation-map.module';
import { WbcSpeciesComponent } from './wbc/wbc-result/wbc-species/wbc-species.component';
import { WbcRoutesComponent } from './wbc/wbc-result/wbc-routes/wbc-routes.component';
import { WbcCensusesComponent } from './wbc/wbc-result/wbc-censuses/wbc-censuses.component';
import { WbcSpeciesListComponent } from './wbc/wbc-result/wbc-species/wbc-species-list/wbc-species-list.component';
import { WbcResultService } from './wbc/wbc-result/wbc-result.service';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';
import { WbcResultFiltersComponent } from './wbc/wbc-result/wbc-result-filters/wbc-result-filters.component';
import { WbcSpeciesChartsComponent } from './wbc/wbc-result/wbc-species-charts/wbc-species-charts.component';
import { WbcSpeciesMapsComponent } from './wbc/wbc-result/wbc-species-charts/wbc-species-maps/wbc-species-maps.component';
import { WbcSpeciesLinechartsComponent } from './wbc/wbc-result/wbc-species-charts/wbc-species-linecharts/wbc-species-linecharts.component';
import { WbcRouteComponent } from './wbc/wbc-result/wbc-route/wbc-route.component';
import { WbcRouteTableComponent } from './wbc/wbc-result/wbc-route-table/wbc-route-table.component';
import { FormPermissionModule } from '../+haseka/form-permission/form-permission.module';
import { NavigationThumbnailModule } from '../shared-modules/navigation-thumbnail/navigation-thumbnail.module';
import { LatestDocumentsModule } from '../shared-modules/latest-documents/latest-documents.module';
import { WbcTableFilterComponent } from './wbc/wbc-result/wbc-table-filter/wbc-table-filter.component';
import { WbcRoutesListComponent } from './wbc/wbc-result/wbc-routes/wbc-routes-list/wbc-routes-list.component';
import { WbcRoutesMapComponent } from './wbc/wbc-result/wbc-routes/wbc-routes-map/wbc-routes-map.component';
import { MonitoringThemeBaseComponent } from './common/monitoring-theme-base.component';
import { ChecklistComponent } from './checklist/checklist.component';
import { InfoPageModule } from '../shared-modules/info-page/info-page.module';
import { InstructionsComponent } from './common/instructions/instructions.component';
import { ThemePageComponent } from './common/theme-page.component';
import { FormComponent } from './common/form/form.component';
import { ThemeOwnSubmissionsComponent } from './common/theme-own-submissions/theme-own-submissions.component';
import { LajiUiModule } from '../../../projects/laji-ui/src/public-api';
import { ObservationComponentModule } from '../+observation/observation-component.module';
import { GeneticResourceComponent } from './genetic-resource/genetic-resource.component';
import { DownloadModule } from '../shared-modules/download/download.module';
import { TableColumnService } from '../shared-modules/datatable/service/table-column.service';
import { ObservationTableColumnService } from '../shared-modules/datatable/service/observation-table-column.service';
import { DatasetsComponent } from './datasets/datasets.component';
import { InfoModule } from '../shared-modules/info/info.module';
import { ThemeImportComponent } from './common/theme-import/theme-import.component';
import { SpreadsheetModule } from '../shared-modules/spreadsheet/spreadsheet.module';
import { ThemeGenerateSpreadsheetComponent } from './common/theme-generate-spreadsheet/theme-generate-spreadsheet.component';
import { GenericInstructionsComponent } from './common/instructions/generic-instructions/generic-instructions.component';
import { KerttuComponent } from './kerttu/kerttu.component';
import { KerttuInstructionsComponent } from './kerttu/kerttu-instructions/kerttu-instructions.component';
import { ExpertiseFormComponent } from './kerttu/kerttu-expertise-form/expertise-form/expertise-form.component';
import { LolifeInstructionsComponent } from './lolife/lolife-instructions/lolife-instructions.component';
import { KerttuApi } from './kerttu/service/kerttu-api';
import { AudioService } from './kerttu/service/audio.service';
import { SpectrogramService } from './kerttu/service/spectrogram.service';
import { FormHasFeaturePipe } from './pipe/form-has-feature.pipe';
import { ThemeBreadcrumbComponent } from './common/theme-breadcrumb/theme-breadcrumb.component';
import { LetterAnnotationComponent } from './kerttu/kerttu-letter-annotation/letter-annotation/letter-annotation.component';
import { AudioViewerComponent } from './kerttu/audio-viewer/audio-viewer.component';
import { RecordingAnnotationComponent } from './kerttu/kerttu-recording-annotation/recording-annotation/recording-annotation.component';
import { ThreeStateSwitchModule } from '../shared-modules/three-state-switch/three-state-switch.module';
import { PillListModule } from '../shared-modules/pill-list/pill-list.module';
import { PinkkaComponent } from './pinkka/pinkka.component';
import { InsectGuideComponent } from './insect-guide/insect-guide.component';
import { AudioSpectrogramComponent } from './kerttu/audio-viewer/audio-spectrogram/audio-spectrogram.component';
import { BirdPointCountResultComponent } from './bird-point-count/bird-point-count-result/bird-point-count-result.component';
import { ChartModule } from '../shared-modules/chart/chart.module';
import { KerttuExpertiseFormComponent } from './kerttu/kerttu-expertise-form/kerttu-expertise-form.component';
import { KerttuLetterAnnotationComponent } from './kerttu/kerttu-letter-annotation/kerttu-letter-annotation.component';
import { KerttuRecordingAnnotationComponent } from './kerttu/kerttu-recording-annotation/kerttu-recording-annotation.component';
import { RequiresAudioSupportDirective } from './kerttu/directive/requires-audio-support.directive';
import { AudioNotSupportedErrorComponent } from './kerttu/directive/audio-not-supported-error.component';
import { SelectModule } from '../shared-modules/select/select.module';

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
    JwBootstrapSwitchNg2Module,
    FormPermissionModule,
    NavigationThumbnailModule,
    LatestDocumentsModule,
    InfoPageModule,
    LajiUiModule,
    ObservationComponentModule,
    DownloadModule,
    InfoModule,
    SpreadsheetModule,
    ThreeStateSwitchModule,
    PillListModule,
    ChartModule,
    SelectModule
  ],
  declarations: [
    HerpetologyComponent,
    ChecklistComponent,
    PinkkaComponent,
    InsectGuideComponent,
    ThemeResultComponent,
    NafiResultComponent,
    ThemeObservationListComponent,
    ThemeMyDocumentListComponent,
    YkjComponent,
    EmkComponent,
    WbcResultComponent,
    WbcInstructionsComponent,
    LineTransectResultComponent,
    LineTransectResultGridComponent,
    LineTransectResultChartComponent,
    LineTransectInstructionsComponent,
    IdentifyComponent,
    NafiTemplatesComponent,
    ThemeComponent,
    QualityComponent,
    MostActiveUsersTableComponent,
    AnnotationTableComponent,
    QualityFiltersComponent,
    WbcSpeciesComponent,
    WbcRoutesComponent,
    WbcCensusesComponent,
    WbcSpeciesListComponent,
    WbcResultFiltersComponent,
    WbcSpeciesChartsComponent,
    WbcSpeciesMapsComponent,
    WbcSpeciesLinechartsComponent,
    WbcRouteComponent,
    WbcRouteTableComponent,
    WbcTableFilterComponent,
    WbcRoutesListComponent,
    WbcRoutesMapComponent,
    InstructionsComponent,
    ThemePageComponent,
    MonitoringThemeBaseComponent,
    FormComponent,
    ThemeOwnSubmissionsComponent,
    GeneticResourceComponent,
    DatasetsComponent,
    ThemeImportComponent,
    ThemeGenerateSpreadsheetComponent,
    GenericInstructionsComponent,
    KerttuComponent,
    KerttuInstructionsComponent,
    ExpertiseFormComponent,
    LolifeInstructionsComponent,
    FormHasFeaturePipe,
    LetterAnnotationComponent,
    AudioViewerComponent,
    ThemeBreadcrumbComponent,
    RecordingAnnotationComponent,
    AudioSpectrogramComponent,
    BirdPointCountResultComponent,
    KerttuExpertiseFormComponent,
    KerttuLetterAnnotationComponent,
    KerttuRecordingAnnotationComponent,
    RequiresAudioSupportDirective,
    AudioNotSupportedErrorComponent
  ],
  providers: [
    ResultService,
    QualityService,
    WbcResultService,
    KerttuApi,
    AudioService,
    SpectrogramService,
    {provide: TableColumnService, useClass: ObservationTableColumnService},
  ]
})
export class ThemeModule { }
