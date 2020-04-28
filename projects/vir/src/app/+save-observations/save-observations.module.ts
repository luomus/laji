import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SaveObservationsRoutingModule } from './save-observations-routing.module';
import { SaveObservationsComponent } from './save-observations.component';


@NgModule({
  declarations: [SaveObservationsComponent],
  imports: [
    CommonModule,
    SaveObservationsRoutingModule
  ]
})
export class SaveObservationsModule { }
