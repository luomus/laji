import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatatableComponent } from './datatable/datatable.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { LangModule } from '../lang/lang.module';
import { SpinnerModule } from '../spinner/spinner.module';

@NgModule({
  imports: [
    CommonModule,
    NgxDatatableModule,
    LangModule,
    SpinnerModule
  ],
  declarations: [DatatableComponent],
  exports: [DatatableComponent]
})
export class DatatableModule { }
