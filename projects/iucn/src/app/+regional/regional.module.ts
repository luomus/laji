import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegionalRoutingModule } from './regional-routing.module';
import { RegionalComponent } from './regional/regional.component';
import { InfoPageModule } from '../../../../laji/src/app/shared-modules/info-page/info-page.module';
import { IucnSharedModule } from '../iucn-shared/shared.module';
import {SharedModule} from '../../../../laji/src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RegionalRoutingModule,
    InfoPageModule,
    IucnSharedModule
  ],
  declarations: [RegionalComponent]
})
export class RegionalModule { }
