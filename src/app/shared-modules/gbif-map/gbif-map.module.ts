import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LajiMapModule } from '@laji-map/laji-map.module';
import { SharedModule } from '../../shared/shared.module';
import { GbifMapComponent } from './gbif-map/gbif-map.component';

@NgModule({
  imports: [
    CommonModule,
    LajiMapModule,
    SharedModule
  ],
  declarations: [GbifMapComponent],
  exports: [GbifMapComponent]
})
export class GbifMapModule { }
