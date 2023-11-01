import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaxonSelectComponent } from './taxon-select.component';
import { FormsModule } from '@angular/forms';
import { TypeaheadModule } from 'projects/laji-ui/src/lib/typeahead/typeahead.module';

@NgModule({
  declarations: [
    TaxonSelectComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    TypeaheadModule
  ],
  exports: [
    TaxonSelectComponent
  ]
})
export class TaxonSelectModule { }
