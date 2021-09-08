/* tslint:disable:max-line-length */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeRoutingModule } from './theme-routing.module';
import { HerpetologyComponent } from './herpetology/herpetology.component';
import { SharedModule } from '../shared/shared.module';
import { LangModule } from '../shared-modules/lang/lang.module';
import { YkjModule } from '../shared-modules/ykj/ykj.module';
import { IdentifyComponent } from './identify/identify.component';
import { ThemeComponent } from './theme.component';
import { DatatableModule } from '../shared-modules/datatable/datatable.module';
import { QualityService } from './service/quality.service';
import { QualityComponent } from './quality/quality.component';
import { MostActiveUsersTableComponent } from './quality/most-active-users-table/most-active-users-table.component';
import { AnnotationTableComponent } from './quality/annotation-table/annotation-table.component';
import { QualityFiltersComponent } from './quality/quality-filters/quality-filters.component';
import { TaxonAutocompleteModule } from '../shared-modules/taxon-autocomplete/taxon-autocomplete.module';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';
import { ChecklistComponent } from './checklist/checklist.component';
import { InfoPageModule } from '../shared-modules/info-page/info-page.module';
import { LajiUiModule } from '../../../../laji-ui/src/public-api';
import { ObservationComponentModule } from '../+observation/observation-component.module';
import { GeneticResourceComponent } from './genetic-resource/genetic-resource.component';
import { TableColumnService } from '../shared-modules/datatable/service/table-column.service';
import { ObservationTableColumnService } from '../shared-modules/datatable/service/observation-table-column.service';
import { DatasetsComponent } from './datasets/datasets.component';
import { InfoModule } from '../shared-modules/info/info.module';
import { KerttuComponent } from './kerttu/kerttu.component';
import { KerttuInstructionsComponent } from './kerttu/kerttu-instructions/kerttu-instructions.component';
import { ExpertiseFormComponent } from './kerttu/kerttu-expertise-form/expertise-form/expertise-form.component';
import { KerttuApi } from './kerttu/service/kerttu-api';
import { KerttuTaxonService } from './kerttu/service/kerttu-taxon-service';
import { AudioService } from './kerttu/audio-viewer/service/audio.service';
import { SpectrogramService } from './kerttu/audio-viewer/service/spectrogram.service';
import { ThemeBreadcrumbComponent } from './common/theme-breadcrumb/theme-breadcrumb.component';
import { LetterAnnotationComponent } from './kerttu/kerttu-letter-annotation/letter-annotation/letter-annotation.component';
import { AudioViewerComponent } from './kerttu/audio-viewer/audio-viewer.component';
import { RecordingAnnotationComponent } from './kerttu/kerttu-recording-annotation/recording-annotation/recording-annotation.component';
import { ThreeStateSwitchModule } from '../shared-modules/three-state-switch/three-state-switch.module';
import { PillListModule } from '../shared-modules/pill-list/pill-list.module';
import { PinkkaComponent } from './pinkka/pinkka.component';
import { BibliographyComponent } from './bibliography/bibliography.component';
import { InsectGuideComponent } from './insect-guide/insect-guide.component';
import { AudioSpectrogramComponent } from './kerttu/audio-viewer/audio-spectrogram/audio-spectrogram.component';
import { KerttuExpertiseFormComponent } from './kerttu/kerttu-expertise-form/kerttu-expertise-form.component';
import { KerttuLetterAnnotationComponent } from './kerttu/kerttu-letter-annotation/kerttu-letter-annotation.component';
import { KerttuRecordingAnnotationComponent } from './kerttu/kerttu-recording-annotation/kerttu-recording-annotation.component';
import { RequiresAudioSupportDirective } from './kerttu/directive/requires-audio-support.directive';
import { AudioNotSupportedErrorComponent } from './kerttu/directive/audio-not-supported-error.component';
import { AudioIosWarningComponent } from './kerttu/directive/audio-ios-warning.component';
import { SelectModule } from '../shared-modules/select/select.module';
import { ProtaxComponent } from './protax/protax.component';
import { ProtaxApi } from './protax/protax-api';
import { ProtaxFormComponent } from './protax/protax-form/protax-form.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { GeneticResourceLayoutComponent } from './genetic-resource/layout/genetic-resource-layout.component';
import { GeneticResourceInstructionsComponent } from './genetic-resource/instructions/genetic-resource-instructions.component';
import { KerttuOccurrenceTableComponent } from './kerttu/kerttu-recording-annotation/kerttu-occurrence-table/kerttu-occurrence-table.component';
import { KerttuResultComponent } from './kerttu/kerttu-result/kerttu-result.component';
import { KerttuUserTableComponent } from './kerttu/kerttu-result/kerttu-user-table/kerttu-user-table.component';
import { KerttuCountComponent } from './kerttu/kerttu-result/kerttu-count/kerttu-count.component';
import { LajiMapModule } from '@laji-map/laji-map.module';
import { AudioInfoComponent } from './kerttu/audio-viewer/audio-info/audio-info.component';
import { AudioInfoMapComponent } from './kerttu/audio-viewer/audio-info/audio-info-map/audio-info-map.component';
import { KerttuLetterResultTableComponent } from './kerttu/kerttu-result/kerttu-letter-result-table/kerttu-letter-result-table.component';

/* tslint:enable:max-line-length */

@NgModule({
  imports: [
    CommonModule,
    ThemeRoutingModule,
    SharedModule,
    LangModule,
    YkjModule,
    DatatableModule,
    TaxonAutocompleteModule,
    JwBootstrapSwitchNg2Module,
    InfoPageModule,
    LajiUiModule,
    ObservationComponentModule,
    InfoModule,
    ThreeStateSwitchModule,
    PillListModule,
    SelectModule,
    LajiMapModule
  ],
  declarations: [
    HerpetologyComponent,
    ChecklistComponent,
    PinkkaComponent,
    BibliographyComponent,
    InsectGuideComponent,
    IdentifyComponent,
    ThemeComponent,
    QualityComponent,
    MostActiveUsersTableComponent,
    AnnotationTableComponent,
    QualityFiltersComponent,
    GeneticResourceComponent,
    DatasetsComponent,
    KerttuComponent,
    KerttuInstructionsComponent,
    ExpertiseFormComponent,
    LetterAnnotationComponent,
    AudioViewerComponent,
    ThemeBreadcrumbComponent,
    RecordingAnnotationComponent,
    AudioSpectrogramComponent,
    KerttuExpertiseFormComponent,
    KerttuLetterAnnotationComponent,
    KerttuRecordingAnnotationComponent,
    RequiresAudioSupportDirective,
    AudioNotSupportedErrorComponent,
    AudioIosWarningComponent,
    ProtaxComponent,
    ProtaxFormComponent,
    NotFoundComponent,
    GeneticResourceLayoutComponent,
    GeneticResourceInstructionsComponent,
    KerttuOccurrenceTableComponent,
    KerttuResultComponent,
    KerttuUserTableComponent,
    KerttuCountComponent,
    AudioInfoComponent,
    AudioInfoMapComponent,
    KerttuLetterResultTableComponent
  ],
  providers: [
    QualityService,
    KerttuApi,
    KerttuTaxonService,
    AudioService,
    SpectrogramService,
    ProtaxApi,
    {provide: TableColumnService, useClass: ObservationTableColumnService},
  ]
})
export class ThemeModule { }
