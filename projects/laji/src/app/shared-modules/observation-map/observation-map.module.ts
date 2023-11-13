import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservationMapComponent } from './observation-map/observation-map.component';
import { LajiMapModule } from 'projects/laji/src/app/shared-modules/laji-map/laji-map.module';
import { SharedModule } from '../../shared/shared.module';
import { LajiUiModule } from '../../../../../laji-ui/src/public-api';
import { DatatableModule } from '../datatable/datatable.module';
import { ObservationMapTableComponent } from './observation-map/observation-map-table/observation-map-table.component';
import { LajiLegendModule } from '../legend/legend.module';

@NgModule({
    declarations: [ObservationMapComponent, ObservationMapTableComponent],
    exports: [ObservationMapComponent],
    imports: [
        CommonModule,
        LajiMapModule,
        SharedModule,
        LajiUiModule,
        DatatableModule,
        LajiLegendModule
    ]
})
export class ObservationMapModule { }
