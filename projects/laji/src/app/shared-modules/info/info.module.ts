import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoComponent } from './info/info.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { UtilitiesModule } from '../utilities/utilities.module';
import { LajiUiModule } from 'projects/laji-ui/src/public-api';

@NgModule({
  imports: [
    CommonModule,
    PopoverModule,
    ModalModule,
    UtilitiesModule,
    LajiUiModule
  ],
  declarations: [InfoComponent],
  exports: [InfoComponent]
})
export class InfoModule { }
