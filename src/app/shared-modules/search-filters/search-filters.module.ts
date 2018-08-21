import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetadataSelectComponent } from './metadata-select/metadata-select.component';
import { ObservationActiveComponent } from './active/observation-active.component';
import { SharedModule } from '../../shared/shared.module';
import { SearchFiltersComponent } from './search-filters/search-filters.component';
import { LajiSelectModule } from '../select/select.module';
import { JWBootstrapSwitchModule } from 'jw-bootstrap-switch-ng2';
import { ThreeStateSwitchComponent } from './three-state-switch/three-state-switch.component';
import { ThreeStateMultiSwitchComponent } from './three-state-multi-switch/three-state-multi-switch.component';
import { SwitchRowComponent } from './three-state-multi-switch/switch-row/switch-row.component';
import { IndeterminateCheckboxComponent } from './three-state-multi-switch/switch-row/indeterminate-checkbox/indeterminate-checkbox.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    LajiSelectModule,
    JWBootstrapSwitchModule
  ],
  declarations: [
    MetadataSelectComponent,
    ThreeStateSwitchComponent,
    ThreeStateMultiSwitchComponent,
    SwitchRowComponent,
    IndeterminateCheckboxComponent,
    ObservationActiveComponent,
    SearchFiltersComponent
  ],
  exports: [
    MetadataSelectComponent,
    ThreeStateSwitchComponent,
    ThreeStateMultiSwitchComponent,
    SearchFiltersComponent
  ]
})
export class SearchFiltersModule { }
