import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatatableModule } from '../../../../laji/src/app/shared-modules/datatable/datatable.module';

import { LetterAnnotationRoutingModule } from './letter-annotation-routing.module';
import { SpeciesListComponent } from './species-list/species-list.component';
import { SpeciesTableComponent } from './species-list/species-table/species-table.component';

@NgModule({
  imports: [
    CommonModule,
    DatatableModule,
    LetterAnnotationRoutingModule
  ],
  declarations: [SpeciesListComponent, SpeciesTableComponent]
})
export class LetterAnnotationModule { }
