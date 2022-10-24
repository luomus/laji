import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservationMapComponent } from './observation-map/observation-map.component';
import { LajiMapModule } from '@laji-map/laji-map.module';
import { SharedModule } from '../../shared/shared.module';
import { LajiUiModule } from '../../../../../laji-ui/src/public-api';
import { ObservationClusterTableComponent } from './observation-map/observation-cluster-table/observation-cluster-table.component';
import { DatatableModule } from '../datatable/datatable.module';

@NgModule({
  imports: [
    CommonModule,
    LajiMapModule,
    SharedModule,
    LajiUiModule,
    DatatableModule
  ],
  declarations: [ObservationMapComponent, ObservationClusterTableComponent],
  exports: [ObservationMapComponent]
})
export class ObservationMapModule { }
