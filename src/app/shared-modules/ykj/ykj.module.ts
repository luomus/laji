import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YkjMapComponent } from './ykj-map/ykj-map.component';
import { LangModule } from '../lang/lang.module';
import { LajiMapModule } from '../map/laji-map.module';
import { YkjService } from './service/ykj.service';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { TaxonomyApi } from '../../shared/api/TaxonomyApi';

@NgModule({
  imports: [
    CommonModule,
    LangModule,
    LajiMapModule
  ],
  declarations: [YkjMapComponent],
  providers: [YkjService, WarehouseApi, TaxonomyApi, YkjService],
  exports: [YkjMapComponent]
})
export class YkjModule { }
