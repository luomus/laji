import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { IucnSharedModule } from '../iucn-shared/shared.module';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { IucnResultPieComponent } from './iucn-result-pie/iucn-result-pie.component';
import { LangModule } from '../../../../laji/src/app/shared-modules/lang/lang.module';
import { IucnCommonModule } from '../../../../laji/src/app/shared-modules/iucn/iucn.module';
import { ChartModule } from 'projects/laji/src/app/shared-modules/chart/chart.module';

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    IucnSharedModule,
    SharedModule,
    ChartModule,
    LangModule,
    IucnCommonModule
  ],
  declarations: [HomeComponent, IucnResultPieComponent]
})
export class IucnHomeModule { }
