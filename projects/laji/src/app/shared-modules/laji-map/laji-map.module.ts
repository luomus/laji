import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LajiMapComponent } from './laji-map.component';
// import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { InfoModule } from '../info/info.module';

@NgModule({
  imports: [
    CommonModule,
    // BsDropdownModule,
    TranslateModule,
    InfoModule
  ],
  declarations: [ LajiMapComponent ],
  exports: [ LajiMapComponent ]
})
export class LajiMapModule { }
