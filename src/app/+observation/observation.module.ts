import { NgModule } from '@angular/core';
import { routing } from './observation.routes';
import { ObservationFacade } from './observation.facade';
import { ObservationComponentModule } from './observation-component.module';
import { TableColumnService } from '../shared-modules/datatable/service/table-column.service';
import { ObservationTableColumnService } from '../shared-modules/datatable/service/observation-table-column.service';
import { TaxonAutocompleteService } from '../shared/service/taxon-autocomplete.service';
import { LabelPipe } from '../shared/pipe/label.pipe';

@NgModule({
  imports: [
    routing,
    ObservationComponentModule
  ],
  declarations: [],
  providers: [
    ObservationFacade,
    TaxonAutocompleteService,
    LabelPipe,
    {provide: TableColumnService, useClass: ObservationTableColumnService},
  ]
})
export class ObservationModule {
}
