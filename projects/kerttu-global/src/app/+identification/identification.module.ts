import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdentificationRoutingModule } from './identification-routing.module';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { KerttuGlobalSharedModule } from '../kerttu-global-shared/shared.module';
import { LajiUiModule } from '../../../../laji-ui/src/lib/laji-ui.module';
import { IdentificationComponent } from './identification.component';
import { IdentificationInstructionsComponent } from './identification-instructions/identification-instructions.component';
import { RecordingIdentificationComponent } from './recording-identification/recording-identification.component';
import { IdentificationViewComponent } from './recording-identification/identification-view/identification-view.component';
import { ExpertiseComponent } from './expertise/expertise.component';
import { IdentificationResultsComponent } from './identification-results/identification-results.component';
import { InfoPageModule } from '../../../../laji/src/app/shared-modules/info-page/info-page.module';
import { AudioViewerModule } from '../../../../laji/src/app/shared-modules/audio-viewer/audio-viewer.module';
import { TaxonSelectComponent } from './recording-identification/identification-view/taxon-select/taxon-select.component';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { IdentificationTableComponent } from './recording-identification/identification-view/identification-table/identification-table.component';
import { DatatableModule } from '../../../../laji/src/app/shared-modules/datatable/datatable.module';
import { SiteSelectionViewComponent } from './recording-identification/site-selection-view/site-selection-view.component';
import { SiteSelectionMapComponent } from './recording-identification/site-selection-view/site-selection-map/site-selection-map.component';
import { LajiMapModule } from '@laji-map/laji-map.module';
import { ExpertiseByContinentComponent } from './expertise/expertise-by-continent/expertise-by-continent.component';
import { SiteTableComponent } from './recording-identification/site-selection-view/site-table/site-table.component';
import { SiteResultMapComponent } from './identification-results/site-result-map/site-result-map.component';
import { IdentificationUserTableComponent } from './identification-results/identification-user-table/identification-user-table.component';
import { SelectModule } from '../../../../laji/src/app/shared-modules/select/select.module';
import { IdentificationPanelComponent } from './recording-identification/identification-view/identification-table/identification-panel/identification-panel.component';
import { IdentificationSpeciesTableComponent } from './identification-results/identification-species-table/identification-species-table.component';
import { IdentificationHistoryComponent } from './identification-history/identification-history.component';
import { IdentificationHistoryTableComponent } from './identification-history/identification-history-table/identification-history-table.component';
import { IdentificationHistoryEditModalComponent } from './identification-history/identification-history-edit-modal/identification-history-edit-modal.component';
import { AudioService } from '../../../../laji/src/app/shared-modules/audio-viewer/service/audio.service';
import { AudioCacheLoaderService } from './service/audio-cache-loader.service';
import { RecordingLoaderService } from './service/recording-loader.service';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';

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
    DatatableModule,
    LajiMapModule,
    SelectModule,
    JwBootstrapSwitchNg2Module
  ],
  declarations: [
    IdentificationComponent,
    IdentificationInstructionsComponent,
    RecordingIdentificationComponent,
    ExpertiseComponent,
    IdentificationResultsComponent,
    TaxonSelectComponent,
    IdentificationTableComponent,
    IdentificationViewComponent,
    SiteSelectionViewComponent,
    SiteSelectionMapComponent,
    ExpertiseByContinentComponent,
    SiteTableComponent,
    SiteResultMapComponent,
    IdentificationUserTableComponent,
    IdentificationPanelComponent,
    IdentificationSpeciesTableComponent,
    IdentificationHistoryComponent,
    IdentificationHistoryTableComponent,
    IdentificationHistoryEditModalComponent,
  ],
  providers: [
    AudioService,
    AudioCacheLoaderService,
    RecordingLoaderService
  ]
})
export class IdentificationModule { }
