import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaxonAutocompleteComponent } from './taxon-autocomplete.component';
import { TypeaheadModule } from 'ngx-bootstrap';
import {SharedModule} from '../../shared/shared.module';

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
