import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ObservationMapComponent } from './observation-map/observation-map.component';
import { LajiMapModule } from '@laji-map/laji-map.module';
import { SharedModule } from '../../shared/shared.module';
import { LajiUiModule } from '../../../../../laji-ui/src/public-api';

@NgModule({
  imports: [
    CommonModule,
    LajiMapModule,
    SharedModule,
    LajiUiModule
  ],
  declarations: [ObservationMapComponent],
  exports: [ObservationMapComponent]
})
export class ObservationMapModule { }
