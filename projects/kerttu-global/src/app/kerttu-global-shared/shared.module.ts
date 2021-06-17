import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';
import { SpeciesListFiltersComponent } from './component/species-list-filters/species-list-filters.component';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    JwBootstrapSwitchNg2Module
  ],
  declarations: [
    SpeciesListFiltersComponent
  ],
  exports: [
    SpeciesListFiltersComponent
  ]
})
export class KerttuGlobalSharedModule { }
