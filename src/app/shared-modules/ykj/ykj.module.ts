import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YkjMapComponent } from './ykj-map/ykj-map.component';
import { LangModule } from '../lang/lang.module';
import { LajiMapModule } from '@laji-map/laji-map.module';
import { YkjService } from './service/ykj.service';
import { WarehouseApi } from '../../shared/api/WarehouseApi';
import { TaxonomyApi } from '../../shared/api/TaxonomyApi';
import { BsDropdownModule } from 'ngx-bootstrap';
import { InfoModule } from '../info/info.module';

@NgModule({
  imports: [
    CommonModule,
    LangModule,
    LajiMapModule,
    BsDropdownModule,
    InfoModule
  ],
  declarations: [YkjMapComponent],
  providers: [YkjService, WarehouseApi, TaxonomyApi],
  exports: [YkjMapComponent]
})
export class YkjModule { }
