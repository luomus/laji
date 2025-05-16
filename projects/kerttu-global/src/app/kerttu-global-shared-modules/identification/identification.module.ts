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

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    KerttuGlobalSharedModule,
    LajiUiModule,
    TypeaheadModule,
    AudioViewerModule,
    JwBootstrapSwitchNg2Module
  ],
  declarations: [
    IdentificationMainComponent,
    IdentificationViewComponent,
    TaxonSelectComponent,
    IdentificationTableComponent,
    IdentificationPanelComponent,
    AudioViewerCustomControlsComponent,
    IdentificationNavComponent
  ],
  exports: [IdentificationMainComponent, IdentificationViewComponent]
})
export class IdentificationModule { }
