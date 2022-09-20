import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LajiMapComponent } from './laji-map.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { LajiMapLegend } from './visualization/legend.component';
import { SimpleLegend } from './visualization/simple-legend.component';

@NgModule({
  imports: [
    CommonModule,
    BsDropdownModule,
    TranslateModule
  ],
  declarations: [LajiMapComponent, LajiMapLegend, SimpleLegend],
  exports: [LajiMapComponent]
})
export class LajiMapModule { }
