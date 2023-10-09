import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LajiMapComponent } from './laji-map.component';
import { TranslateModule } from '@ngx-translate/core';
import { InfoModule } from '../info/info.module';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    InfoModule
  ],
  declarations: [ LajiMapComponent ],
  exports: [ LajiMapComponent ]
})
export class LajiMapModule { }
