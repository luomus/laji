import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { KerttuGlobalSharedModule } from '../kerttu-global-shared/shared.module';
import { DatatableModule } from '../../../../laji/src/app/shared-modules/datatable/datatable.module';
import { AudioViewerModule } from '../../../../laji/src/app/shared-modules/audio-viewer/audio-viewer.module';
import { LajiUiModule } from '../../../../laji-ui/src/lib/laji-ui.module';
import { ValidationRoutingModule } from './validation-routing.module';
import { ValidationComponent } from './validation.component';
import { SpeciesListComponent } from './species-select/species-list/species-list.component';
import { SpeciesTableComponent } from './species-select/species-list/species-table/species-table.component';
import { SpeciesValidationComponent } from './species-validation/species-validation.component';
import { RecordingsComponent } from './species-validation/species-template-validation/recordings/recordings.component';
import { TemplatesComponent } from './species-validation/species-template-validation/templates/templates.component';
import { TemplateComponent } from './species-validation/species-template-validation/template/template.component';
import { SpeciesTemplateValidationComponent } from './species-validation/species-template-validation/species-template-validation.component';
import { VersionNavComponent } from './species-validation/version-nav/version-nav.component';
import { AudioInfoComponent } from './species-validation/species-template-validation/audio-info/audio-info.component';
import { AudioDatePipe } from './species-validation/species-template-validation/audio-info/audio-date.pipe';
import { AudioLocationPipe } from './species-validation/species-template-validation/audio-info/audio-location.pipe';
import { SpeciesListQueryService } from './service/species-list-query.service';
import { SpeciesListQueryResetGuard } from './service/species-list-query-reset.guard';
import { SpeciesSelectComponent } from './species-select/species-select.component';
import { ValidationInstructionsComponent } from './validation-instructions/validation-instructions.component';
import { InfoPageModule } from '../../../../laji/src/app/shared-modules/info-page/info-page.module';
import { LicenseComponent } from './species-validation/species-template-validation/audio-info/license.component';
import { ModalModule } from 'projects/laji-ui/src/lib/modal/modal.module';
import { TooltipModule } from 'projects/laji-ui/src/lib/tooltip/tooltip.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    KerttuGlobalSharedModule,
    DatatableModule,
    AudioViewerModule,
    LajiUiModule,
    InfoPageModule,
    ValidationRoutingModule,
    ModalModule,
    TooltipModule
  ],
  declarations: [
    ValidationComponent,
    SpeciesListComponent,
    SpeciesTableComponent,
    SpeciesValidationComponent,
    RecordingsComponent,
    TemplatesComponent,
    TemplateComponent,
    SpeciesTemplateValidationComponent,
    VersionNavComponent,
    AudioInfoComponent,
    AudioDatePipe,
    AudioLocationPipe,
    SpeciesSelectComponent,
    ValidationInstructionsComponent,
    LicenseComponent
  ],
  providers: [
    SpeciesListQueryService,
    SpeciesListQueryResetGuard,
    DatePipe
  ]
})
export class ValidationModule { }
