import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoPageComponent } from './info-page.component';
import { LajiUiModule } from '../../../../projects/laji-ui/src/public-api';
import { UtilitiesModule } from '../utilities/utilities.module';

@NgModule({
  declarations: [InfoPageComponent],
  imports: [
    CommonModule,
    LajiUiModule,
    UtilitiesModule
  ],
  exports: [InfoPageComponent]
})
export class InfoPageModule { }
