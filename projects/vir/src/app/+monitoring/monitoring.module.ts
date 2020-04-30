import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SaveObservationsRoutingModule } from './monitoring-routing.module';
import { MonitoringComponent } from './monitoring.component';


@NgModule({
  declarations: [MonitoringComponent],
  imports: [
    CommonModule,
    SaveObservationsRoutingModule
  ]
})
export class MonitoringModule { }
