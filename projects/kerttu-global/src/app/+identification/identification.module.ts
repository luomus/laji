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
import { InfoPageModule } from '../../../../laji/src/app/shared-modules/info-page/info-page.module';
import { DatatableModule } from '../../../../laji/src/app/shared-modules/datatable/datatable.module';
import { SiteSelectionViewComponent } from './recording-identification/site-selection/site-selection-view/site-selection-view.component';
import { SiteSelectionMapComponent } from './recording-identification/site-selection/site-selection-view/site-selection-map/site-selection-map.component';
import { LajiMapModule } from 'projects/laji/src/app/shared-modules/laji-map/laji-map.module';
import { ExpertiseByContinentComponent } from './expertise/expertise-by-continent/expertise-by-continent.component';
import { SiteTableComponent } from './recording-identification/site-selection/site-selection-view/site-table/site-table.component';
import { JwBootstrapSwitchNg2Module } from '@servoy/jw-bootstrap-switch-ng2';
import { SiteSelectionComponent } from './recording-identification/site-selection/site-selection.component';
import { IdentificationModule as SharedIdentificationModule } from '../kerttu-global-shared-modules/identification/identification.module';
import {
  BirdIdentificationHistoryComponent
} from './bird-identification-history/bird-identification-history.component';
import {
  BirdIdentificationResultsComponent
} from './bird-identification-results/bird-identification-results.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    KerttuGlobalSharedModule,
    LajiUiModule,
    InfoPageModule,
    IdentificationRoutingModule,
    DatatableModule,
    LajiMapModule,
    SharedIdentificationModule,
    JwBootstrapSwitchNg2Module
  ],
  declarations: [
    IdentificationComponent,
    IdentificationInstructionsComponent,
    RecordingIdentificationComponent,
    ExpertiseComponent,
    SiteSelectionViewComponent,
    SiteSelectionMapComponent,
    ExpertiseByContinentComponent,
    SiteTableComponent,
    SiteSelectionComponent,
    BirdIdentificationHistoryComponent,
    BirdIdentificationResultsComponent
  ]
})
export class IdentificationModule { }
