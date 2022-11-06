import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservationMapComponent } from './observation-map/observation-map.component';
import { LajiMapModule } from '@laji-map/laji-map.module';
import { SharedModule } from '../../shared/shared.module';
import { LajiUiModule } from '../../../../../laji-ui/src/public-api';
import { DatatableModule } from '../datatable/datatable.module';
import { ObservationMapTableComponent } from './observation-map/observation-map-table/observation-map-table.component';

@NgModule({
  imports: [
    CommonModule,
    LajiMapModule,
    SharedModule,
    LajiUiModule,
    DatatableModule
  ],
  declarations: [ObservationMapComponent, ObservationMapTableComponent],
  exports: [ObservationMapComponent]
})
export class ObservationMapModule { }
