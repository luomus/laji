import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectComponent } from '../search-filters/select/select.component';
import { InfoModule } from '../info/info.module';

@NgModule({
  imports: [
    CommonModule,
    InfoModule
  ],
  declarations: [SelectComponent],
  exports: [SelectComponent]
})
export class LajiSelectModule { }
