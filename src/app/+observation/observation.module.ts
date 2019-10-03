import { NgModule } from '@angular/core';
import { routing } from './observation.routes';
import { ObservationFacade } from './observation.facade';
import { ObservationComponentModule } from './observation-component.module';


@NgModule({
  imports: [
    routing,
    ObservationComponentModule
  ],
  declarations: [],
  providers: [
    ObservationFacade
  ]
})
export class ObservationModule {
}
