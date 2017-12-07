import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FindPersonComponent } from './find-person.component';
import { TypeaheadModule } from 'ngx-bootstrap';
import { LangModule } from '../lang/lang.module';
import { FormsModule } from '@angular/forms';

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
