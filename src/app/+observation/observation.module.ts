import { NgModule } from '@angular/core';
import { routing } from './observation.routes';
import { ObservationFacade } from './observation.facade';
import { ObservationComponentModule } from './observation-component.module';
import { ObservationResultListService } from './result-list/observation-result-list.service';

@NgModule({
  imports: [
    routing,
    ObservationComponentModule
  ],
  declarations: [],
  providers: [
    ObservationFacade,
    ObservationResultListService
  ]
})
export class ObservationModule {
}
