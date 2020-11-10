import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoComponent } from './info/info.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { UtilitiesModule } from '../utilities/utilities.module';

@NgModule({
  imports: [
    CommonModule,
    PopoverModule,
    ModalModule,
    UtilitiesModule
  ],
  declarations: [InfoComponent],
  exports: [InfoComponent]
})
export class InfoModule { }
