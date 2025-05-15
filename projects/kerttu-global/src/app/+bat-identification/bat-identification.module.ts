import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { KerttuGlobalSharedModule } from '../kerttu-global-shared/shared.module';
import { BatIdentificationComponent } from './bat-identification.component';
import { LajiUiModule } from '../../../../laji-ui/src/lib/laji-ui.module';
import {
  BatIdentificationInstructionsComponent
} from './bat-identification-instructions/bat-identification-instructions.component';
import { InfoPageModule } from '../../../../laji/src/app/shared-modules/info-page/info-page.module';
import { BatIdentificationRoutingModule } from './bat-identification-routing.module';
import {
  SpeciesSelectionComponent
} from './bat-recording-identification/bat-species-selection/species-selection.component';
import {
  SpeciesSelectionViewComponent
} from './bat-recording-identification/bat-species-selection/bat-species-selection-view/species-selection-view.component';
import {
  SpeciesTableComponent
} from './bat-recording-identification/bat-species-selection/bat-species-selection-view/species-table/species-table.component';
import { DatatableModule } from '../../../../laji/src/app/shared-modules/datatable/datatable.module';
import {
  BatRecordingIdentificationComponent
} from './bat-recording-identification/bat-recording-identification.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    KerttuGlobalSharedModule,
    BatIdentificationRoutingModule,
    LajiUiModule,
    InfoPageModule,
    DatatableModule
  ],
  declarations: [
    BatIdentificationComponent,
    BatIdentificationInstructionsComponent,
    BatRecordingIdentificationComponent,
    SpeciesSelectionComponent,
    SpeciesSelectionViewComponent,
    SpeciesTableComponent
  ]
})
export class BatIdentificationModule { }
