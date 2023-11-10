import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaxonAutocompleteComponent } from './taxon-autocomplete.component';
import { SharedModule } from '../../shared/shared.module';
import { TypeaheadModule } from 'projects/laji-ui/src/lib/typeahead/typeahead.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TypeaheadModule
  ],
  declarations: [
    TaxonAutocompleteComponent,
  ],
  providers: [],
  exports: [
    TaxonAutocompleteComponent
  ]
})
export class TaxonAutocompleteModule { }
