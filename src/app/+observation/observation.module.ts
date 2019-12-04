import { NgModule } from '@angular/core';
import { routing } from './observation.routes';
import { ObservationFacade } from './observation.facade';
import { ObservationComponentModule } from './observation-component.module';
import { TableColumnService } from '../shared-modules/datatable/service/table-column.service';
import { ObservationTableColumnService } from '../shared-modules/datatable/service/observation-table-column.service';

@NgModule({
  imports: [
    routing,
    ObservationComponentModule
  ],
  declarations: [],
  providers: [
    ObservationFacade,
    {provide: TableColumnService, useClass: ObservationTableColumnService},
  ]
})
export class ObservationModule {
}
