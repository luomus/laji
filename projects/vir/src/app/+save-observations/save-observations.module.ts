import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SaveObservationsRoutingModule } from './save-observations-routing.module';
import { SaveObservationsComponent } from './save-observations.component';
import { LajiUiModule } from '../../../../laji-ui/src/public-api';


@NgModule({
  declarations: [SaveObservationsComponent],
  imports: [
    CommonModule,
    SaveObservationsRoutingModule,
    LajiUiModule
  ]
})
export class SaveObservationsModule { }
