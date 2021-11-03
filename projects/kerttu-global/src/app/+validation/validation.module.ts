import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { KerttuGlobalSharedModule } from '../kerttu-global-shared/shared.module';
import { DatatableModule } from '../../../../laji/src/app/shared-modules/datatable/datatable.module';
import { AudioViewerModule } from '../../../../laji/src/app/shared-modules/audio-viewer/audio-viewer.module';
import { LajiUiModule } from '../../../../laji-ui/src/lib/laji-ui.module';
import { ValidationRoutingModule } from './validation-routing.module';
import { ValidationComponent } from './validation.component';
import { SpeciesListComponent } from './species-list/species-list.component';
import { SpeciesTableComponent } from './species-list/species-table/species-table.component';
import { SpeciesValidationComponent } from './species-validation/species-validation.component';
import { LetterCandidatesComponent } from './species-validation/letter-candidates/letter-candidates.component';
import { LetterTemplatesComponent } from './species-validation/letter-templates/letter-templates.component';
import { LetterTemplateComponent } from './species-validation/letter-template/letter-template.component';
import { SpeciesTemplateValidationComponent } from './species-validation/species-template-validation/species-template-validation.component';
import { SmallAudioViewerComponent } from './species-validation/small-audio-viewer/small-audio-viewer.component';
import { VersionNavComponent } from './species-validation/version-nav/version-nav.component';
import { CornellAudioInfoComponent } from './cornell-audio-info/cornell-audio-info.component';
import { CornellAudioDatePipe } from './cornell-audio-info/cornell-audio-date.pipe';
import { SpeciesListQueryService } from './service/species-list-query.service';
import { QueryResetterGuard } from './service/query-resetter.guard';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    KerttuGlobalSharedModule,
    DatatableModule,
    AudioViewerModule,
    LajiUiModule,
    ValidationRoutingModule
  ],
  declarations: [
    ValidationComponent,
    SpeciesListComponent,
    SpeciesTableComponent,
    SpeciesValidationComponent,
    LetterCandidatesComponent,
    LetterTemplatesComponent,
    LetterTemplateComponent,
    SpeciesTemplateValidationComponent,
    SmallAudioViewerComponent,
    VersionNavComponent,
    CornellAudioInfoComponent,
    CornellAudioDatePipe
  ],
  providers: [
    SpeciesListQueryService,
    QueryResetterGuard
  ]
})
export class ValidationModule { }
