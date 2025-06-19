import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YkjMapComponent } from './ykj-map/ykj-map.component';
import { LangModule } from '../lang/lang.module';
import { LajiMapModule } from 'projects/laji/src/app/shared-modules/laji-map/laji-map.module';
import { YkjService } from './service/ykj.service';
import { InfoModule } from '../info/info.module';
import { DropdownModule } from 'projects/laji-ui/src/lib/dropdown/dropdown.module';

@NgModule({
  imports: [
    CommonModule,
    LangModule,
    LajiMapModule,
    DropdownModule,
    InfoModule
  ],
  declarations: [YkjMapComponent],
  providers: [YkjService],
  exports: [YkjMapComponent]
})
export class YkjModule { }
