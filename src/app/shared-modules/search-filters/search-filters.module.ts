/* tslint:disable:max-line-length */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetadataSelectComponent } from './metadata-select/metadata-select.component';
import { ObservationActiveComponent } from './active/observation-active.component';
import { SharedModule } from '../../shared/shared.module';
import { SearchFiltersComponent } from './search-filters/search-filters.component';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';
import { ThreeStateMultiSwitchComponent } from './three-state-multi-switch/three-state-multi-switch.component';
import { SwitchRowComponent } from './three-state-multi-switch/switch-row/switch-row.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { SelectComponent } from './select/select.component';
import { InfoModule } from '../info/info.module';
import { FilterOptionsPipe } from './filter-options.pipe';
import { AdminStatusInfoPipe } from './admin-status-info.pipe';
import { HabitatSelectComponent } from './habitat-select/habitat-select.component';

/* tslint:enable:max-line-length */

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    JwBootstrapSwitchNg2Module,
    InfoModule
  ],
  providers: [ AdminStatusInfoPipe ] ,
  declarations: [
    MetadataSelectComponent,
    ThreeStateMultiSwitchComponent,
    SwitchRowComponent,
    ObservationActiveComponent,
    SearchFiltersComponent,
    SelectComponent,
    CheckboxComponent,
    FilterOptionsPipe,
    AdminStatusInfoPipe,
    HabitatSelectComponent
  ],
  exports: [
    MetadataSelectComponent,
    ThreeStateMultiSwitchComponent,
    SearchFiltersComponent,
    SelectComponent,
    CheckboxComponent,
    AdminStatusInfoPipe,
    HabitatSelectComponent,
    ObservationActiveComponent
  ]
})
export class SearchFiltersModule { }
