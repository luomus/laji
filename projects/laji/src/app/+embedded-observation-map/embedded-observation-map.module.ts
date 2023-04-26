import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmbeddedObservationMapComponent } from './embedded-observation-map.component';
import { routing } from './embedded-observation-map.routes';
import { ObservationMapModule } from '../shared-modules/observation-map/observation-map.module';

@NgModule({
  imports: [
    CommonModule,
    routing,
    ObservationMapModule
  ],
  declarations: [EmbeddedObservationMapComponent]
})
export class EmbeddedObservationMapModule { }
