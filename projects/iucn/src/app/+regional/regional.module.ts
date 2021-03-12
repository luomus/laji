import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegionalRoutingModule } from './regional-routing.module';
import { RegionalComponent } from './regional/regional.component';
import { InfoPageModule } from '../../../../laji/src/app/shared-modules/info-page/info-page.module';
import { IucnSharedModule } from '../iucn-shared/shared.module';
import {SharedModule} from '../../../../laji/src/app/shared/shared.module';
import { RegionalResultsComponent } from './regional/regional-results/regional-results.component';
import { RedListRegionalStatusComponent } from './regional/regional-results/red-list-regional-status/red-list-regional-status.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RegionalRoutingModule,
    InfoPageModule,
    IucnSharedModule
  ],
  declarations: [RegionalComponent, RegionalResultsComponent, RedListRegionalStatusComponent]
})
export class RegionalModule { }
