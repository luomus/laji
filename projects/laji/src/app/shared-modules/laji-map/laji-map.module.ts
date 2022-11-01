import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LajiMapComponent } from './laji-map.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { LajiMapLegendComponent } from './visualization/legend.component';
import { InfoModule } from '../info/info.module';

@NgModule({
  imports: [
    CommonModule,
    BsDropdownModule,
    TranslateModule,
    InfoModule
  ],
  declarations: [ LajiMapComponent, LajiMapLegendComponent ],
  exports: [ LajiMapComponent ]
})
export class LajiMapModule { }
