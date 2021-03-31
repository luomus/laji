import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoPageComponent } from './info-page.component';
import { LajiUiModule } from '../../../../../laji-ui/src/public-api';
import { UtilitiesModule } from '../utilities/utilities.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [InfoPageComponent],
  imports: [
    CommonModule,
    LajiUiModule,
    UtilitiesModule,
    SharedModule
  ],
  exports: [InfoPageComponent]
})
export class InfoPageModule { }
