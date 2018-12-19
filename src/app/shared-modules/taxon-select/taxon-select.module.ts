import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypeaheadModule } from 'ngx-bootstrap';
import { TaxonSelectComponent } from './taxon-select.component';
import { FormsModule } from '@angular/forms';

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
