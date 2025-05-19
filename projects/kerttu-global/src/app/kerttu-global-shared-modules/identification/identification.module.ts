import { NgModule } from '@angular/core';
import { IdentificationMainComponent } from './identification-main/identification-main.component';
import { IdentificationViewComponent } from './identification-main/identification-view/identification-view.component';
import { TaxonSelectComponent } from './identification-main/identification-view/taxon-select/taxon-select.component';
import {
  IdentificationTableComponent
} from './identification-main/identification-view/identification-table/identification-table.component';
import {
  AudioViewerCustomControlsComponent
} from './identification-main/identification-view/audio-viewer-custom-controls/audio-viewer-custom-controls.component';
import {
  IdentificationPanelComponent
} from './identification-main/identification-view/identification-table/identification-panel/identification-panel.component';
import { IdentificationNavComponent } from './identification-main/identification-nav/identification-nav.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../../laji/src/app/shared/shared.module';
import { LajiUiModule } from '../../../../../laji-ui/src/lib/laji-ui.module';
import { TypeaheadModule } from '../../../../../laji-ui/src/lib/typeahead/typeahead.module';
import { KerttuGlobalSharedModule } from '../../kerttu-global-shared/shared.module';
import { AudioViewerModule } from '../../../../../laji/src/app/shared-modules/audio-viewer/audio-viewer.module';
import { JwBootstrapSwitchNg2Module } from '@servoy/jw-bootstrap-switch-ng2';
import { IdentificationHistoryComponent } from './identification-history/identification-history.component';
import {
  IdentificationHistoryTableComponent
} from './identification-history/identification-history-table/identification-history-table.component';
import {
  IdentificationHistoryEditModalComponent
} from './identification-history/identification-history-edit-modal/identification-history-edit-modal.component';
import { DatatableModule } from '../../../../../laji/src/app/shared-modules/datatable/datatable.module';
import { IdentificationResultsComponent } from './identification-results/identification-results.component';
import {
  IdentificationSpeciesTableComponent
} from './identification-results/identification-species-table/identification-species-table.component';
import {
  IdentificationUserTableComponent
} from './identification-results/identification-user-table/identification-user-table.component';
import { SiteResultMapComponent } from './identification-results/site-result-map/site-result-map.component';
import { LajiMapModule } from '../../../../../laji/src/app/shared-modules/laji-map/laji-map.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    KerttuGlobalSharedModule,
    LajiUiModule,
    TypeaheadModule,
    AudioViewerModule,
    JwBootstrapSwitchNg2Module,
    DatatableModule,
    LajiMapModule
  ],
  declarations: [
    IdentificationMainComponent,
    IdentificationViewComponent,
    TaxonSelectComponent,
    IdentificationTableComponent,
    IdentificationPanelComponent,
    AudioViewerCustomControlsComponent,
    IdentificationNavComponent,
    IdentificationHistoryComponent,
    IdentificationHistoryTableComponent,
    IdentificationHistoryEditModalComponent,
    IdentificationResultsComponent,
    IdentificationSpeciesTableComponent,
    IdentificationUserTableComponent,
    SiteResultMapComponent
  ],
  exports: [
    IdentificationMainComponent,
    IdentificationHistoryComponent,
    IdentificationResultsComponent
  ]
})
export class IdentificationModule { }
