import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { DatatableModule } from '../../../../laji/src/app/shared-modules/datatable/datatable.module';
import { AudioViewerModule } from '../../../../laji/src/app/shared-modules/audio-viewer/audio-viewer.module';
import { LajiUiModule } from '../../../../laji-ui/src/lib/laji-ui.module';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';
import { ValidationRoutingModule } from './validation-routing.module';
import { ValidationComponent } from './validation.component';
import { SpeciesListComponent } from './species-list/species-list.component';
import { SpeciesTableComponent } from './species-list/species-table/species-table.component';
import { SpeciesValidationComponent } from './species-validation/species-validation.component';
import { SpeciesListFiltersComponent } from './species-list/species-list-filters/species-list-filters.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    DatatableModule,
    AudioViewerModule,
    LajiUiModule,
    JwBootstrapSwitchNg2Module,
    ValidationRoutingModule
  ],
  declarations: [ValidationComponent, SpeciesListComponent, SpeciesTableComponent, SpeciesValidationComponent, SpeciesListFiltersComponent]
})
export class ValidationModule { }
