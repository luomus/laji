import { NgModule } from '@angular/core';
import { routing } from './observation.routes';
import { ObservationFacade } from './observation.facade';
import { ObservationComponentModule } from './observation-component.module';
import { TableColumnService } from '../shared-modules/datatable/service/table-column.service';


@NgModule({
  imports: [
    routing,
    ObservationComponentModule
  ],
  declarations: [],
  providers: [
    ObservationFacade,
    TableColumnService
  ]
})
export class ObservationModule {
}
