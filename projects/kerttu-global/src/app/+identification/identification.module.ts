import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdentificationRoutingModule } from './identification-routing.module';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { KerttuGlobalSharedModule } from '../kerttu-global-shared/shared.module';
import { LajiUiModule } from '../../../../laji-ui/src/lib/laji-ui.module';
import { IdentificationComponent } from './identification.component';
import { IdentificationInstructionsComponent } from './identification-instructions/identification-instructions.component';
import { RecordingIdentificationComponent } from './recording-identification/recording-identification.component';
import { ExpertiseComponent } from './expertise/expertise.component';
import { IdentificationResultsComponent } from './identification-results/identification-results.component';
import { InfoPageModule } from '../../../../laji/src/app/shared-modules/info-page/info-page.module';
import { AudioViewerModule } from '../../../../laji/src/app/shared-modules/audio-viewer/audio-viewer.module';
import { TaxonSelectComponent } from './recording-identification/taxon-select/taxon-select.component';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { IdentificationTableComponent } from './recording-identification/identification-table/identification-table.component';
import { DatatableModule } from '../../../../laji/src/app/shared-modules/datatable/datatable.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    KerttuGlobalSharedModule,
    LajiUiModule,
    InfoPageModule,
    IdentificationRoutingModule,
    AudioViewerModule,
    TypeaheadModule,
    DatatableModule
  ],
  declarations: [
    IdentificationComponent,
    IdentificationInstructionsComponent,
    RecordingIdentificationComponent,
    ExpertiseComponent,
    IdentificationResultsComponent,
    TaxonSelectComponent,
    IdentificationTableComponent
  ]
})
export class IdentificationModule { }
