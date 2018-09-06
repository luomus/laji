import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoComponent } from './info/info.component';
import { ModalModule, PopoverModule } from 'ngx-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    PopoverModule,
    ModalModule
  ],
  declarations: [InfoComponent],
  exports: [InfoComponent]
})
export class InfoModule { }
