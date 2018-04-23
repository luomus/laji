import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectComponent } from './select/select.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [SelectComponent],
  exports: [SelectComponent]
})
export class LajiSelectModule { }
