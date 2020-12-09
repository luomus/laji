import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapRoutingModule } from './map-routing.module';
import { FrontComponent } from './front/front.component';
import { SharedModule } from '../shared/shared.module';
import { LajiMapModule } from '@laji-map/laji-map.module';
import { ObservationMapModule } from '../shared-modules/observation-map/observation-map.module';

@NgModule({
  imports: [
    CommonModule,
    MapRoutingModule,
    LajiMapModule,
    ObservationMapModule,
    SharedModule
  ],
  declarations: [FrontComponent]
})
export class MapModule { }
