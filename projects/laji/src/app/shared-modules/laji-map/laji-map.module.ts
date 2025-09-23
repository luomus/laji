import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LajiMapComponent } from './laji-map.component';
import { TranslateModule } from '@ngx-translate/core';
import { InfoModule } from '../info/info.module';
import { SharedModule } from '../../shared/shared.module';
import { LajiMapPrintComponent } from './laji-map-print/laji-map-print.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    InfoModule,
    SharedModule
  ],
  declarations: [ LajiMapComponent, LajiMapPrintComponent ],
  exports: [ LajiMapComponent, LajiMapPrintComponent ]
})
export class LajiMapModule { }
