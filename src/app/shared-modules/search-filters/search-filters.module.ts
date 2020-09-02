/* tslint:disable:max-line-length */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservationActiveComponent } from './active/observation-active.component';
import { SharedModule } from '../../shared/shared.module';
import { SearchFiltersComponent } from './search-filters/search-filters.component';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';
import { ThreeStateMultiSwitchComponent } from './three-state-multi-switch/three-state-multi-switch.component';
import { SwitchRowComponent } from './three-state-multi-switch/switch-row/switch-row.component';
import { InfoModule } from '../info/info.module';
import { FilterOptionsPipe } from './filter-options.pipe';
import { AdminStatusInfoPipe } from './admin-status-info.pipe';
import { HabitatSelectComponent } from './habitat-select/habitat-select.component';
import { SelectModule } from '../select/select.module';

/* tslint:enable:max-line-length */

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    JwBootstrapSwitchNg2Module,
    InfoModule,
    SelectModule
  ],
  providers: [ AdminStatusInfoPipe ] ,
  declarations: [
    ThreeStateMultiSwitchComponent,
    SwitchRowComponent,
    ObservationActiveComponent,
    SearchFiltersComponent,
    FilterOptionsPipe,
    AdminStatusInfoPipe,
    HabitatSelectComponent
  ],
  exports: [
    ThreeStateMultiSwitchComponent,
    SearchFiltersComponent,
    AdminStatusInfoPipe,
    HabitatSelectComponent,
    ObservationActiveComponent
  ]
})
export class SearchFiltersModule { }
