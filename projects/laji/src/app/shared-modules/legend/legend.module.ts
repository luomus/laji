import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LegendComponent } from './legend.component';
import { InfoModule } from '../info/info.module';
import { DropdownModule } from 'projects/laji-ui/src/lib/dropdown/dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    TranslateModule,
    InfoModule
  ],
  declarations: [ LegendComponent ],
  exports: [ LegendComponent ]
})
export class LajiLegendModule { }
