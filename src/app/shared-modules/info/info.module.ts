import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoComponent } from './info/info.component';
import { PopoverModule } from 'ngx-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    PopoverModule
  ],
  declarations: [InfoComponent],
  exports: [InfoComponent]
})
export class InfoModule { }
