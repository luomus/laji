import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegionalRoutingModule } from './regional-routing.module';
import { RegionalComponent } from './regional.component';
import { InfoPageModule } from '../../../../laji/src/app/shared-modules/info-page/info-page.module';
import { IucnSharedModule } from '../iucn-shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    RegionalRoutingModule,
    InfoPageModule,
    IucnSharedModule
  ],
  declarations: [RegionalComponent]
})
export class RegionalModule { }
