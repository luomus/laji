
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatatableComponent } from './datatable.component';
import { DatatablePaginatorComponent } from './paginator.component';

@NgModule({
  declarations: [
    DatatableComponent,
    DatatablePaginatorComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DatatableComponent
  ],
})
export class DatatableModule { }
