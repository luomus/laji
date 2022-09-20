import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LajiMapComponent } from './laji-map.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { LajiMapLegendComponent } from './visualization/legend.component';

@NgModule({
  imports: [
    CommonModule,
    BsDropdownModule,
    TranslateModule
  ],
  declarations: [ LajiMapComponent, LajiMapLegendComponent ],
  exports: [ LajiMapComponent ]
})
export class LajiMapModule { }
