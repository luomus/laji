import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { IucnSharedModule } from '../iucn-shared/shared.module';
import { SharedModule } from '../../../../../src/app/shared/shared.module';
import { IucnResultPieComponent } from './iucn-result-pie/iucn-result-pie.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { LangModule } from '../../../../../src/app/shared-modules/lang/lang.module';

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    IucnSharedModule,
    SharedModule,
    NgxChartsModule,
    LangModule
  ],
  declarations: [HomeComponent, IucnResultPieComponent]
})
export class IucnHomeModule { }
