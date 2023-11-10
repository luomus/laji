import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FindPersonComponent } from './find-person.component';
import { LangModule } from '../lang/lang.module';
import { FormsModule } from '@angular/forms';
import { TypeaheadModule } from 'projects/laji-ui/src/lib/typeahead/typeahead.module';

@NgModule({
  imports: [
    LangModule,
    FormsModule,
    CommonModule,
    TypeaheadModule
  ],
  declarations: [FindPersonComponent],
  exports: [FindPersonComponent]
})
export class FindPersonModule { }
