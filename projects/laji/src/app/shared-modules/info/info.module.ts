import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoComponent } from './info/info.component';
import { ModalModule } from 'projects/laji-ui/src/lib/modal/modal.module';
import { UtilitiesModule } from '../utilities/utilities.module';
import { LajiUiModule } from 'projects/laji-ui/src/public-api';
import { UtilitiesDumbDirectivesModule } from '../utilities/directive/dumb-directives/utilities-dumb-directives.module';
import { PopoverModule } from 'projects/laji-ui/src/lib/popover/popover.module';

@NgModule({
  imports: [
    CommonModule,
    PopoverModule,
    ModalModule,
    UtilitiesModule,
    LajiUiModule,
    UtilitiesDumbDirectivesModule
  ],
  declarations: [InfoComponent],
  exports: [InfoComponent]
})
export class InfoModule { }
