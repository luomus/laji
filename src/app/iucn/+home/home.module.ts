import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { IucnSharedModule } from '../iucn-shared/shared.module';
import { SharedModule } from '../../shared/shared.module';
import { IucnResultPieComponent } from './iucn-result-pie/iucn-result-pie.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  imports: [
    CommonModule,
    HomeRoutingModule,
    IucnSharedModule,
    SharedModule,
    NgxChartsModule
  ],
  declarations: [HomeComponent, IucnResultPieComponent]
})
export class HomeModule { }
