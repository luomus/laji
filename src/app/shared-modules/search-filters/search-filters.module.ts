/* tslint:disable:max-line-length */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetadataSelectComponent } from './metadata-select/metadata-select.component';
import { ObservationActiveComponent } from './active/observation-active.component';
import { SharedModule } from '../../shared/shared.module';
import { SearchFiltersComponent } from './search-filters/search-filters.component';
import { JWBootstrapSwitchModule } from 'jw-bootstrap-switch-ng2';
import { ThreeStateSwitchComponent } from './three-state-switch/three-state-switch.component';
import { ThreeStateMultiSwitchComponent } from './three-state-multi-switch/three-state-multi-switch.component';
import { SwitchRowComponent } from './three-state-multi-switch/switch-row/switch-row.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { SelectComponent } from './select/select.component';
import { InfoModule } from '../info/info.module';
import { IncludesPipe } from './includes.pipe';
/* tslint:enable:max-line-length */

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    JWBootstrapSwitchModule,
    InfoModule
  ],
  declarations: [
    MetadataSelectComponent,
    ThreeStateSwitchComponent,
    ThreeStateMultiSwitchComponent,
    SwitchRowComponent,
    ObservationActiveComponent,
    SearchFiltersComponent,
    SelectComponent,
    CheckboxComponent,
    IncludesPipe
  ],
  exports: [
    MetadataSelectComponent,
    ThreeStateSwitchComponent,
    ThreeStateMultiSwitchComponent,
    SearchFiltersComponent,
    SelectComponent,
    CheckboxComponent
  ]
})
export class SearchFiltersModule { }
