import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { LegendComponent } from './legend.component';
import { InfoModule } from '../info/info.module';

@NgModule({
  imports: [
    CommonModule,
    BsDropdownModule,
    TranslateModule,
    InfoModule
  ],
  declarations: [ LegendComponent ],
  exports: [ LegendComponent ]
})
export class LajiLegendModule { }
