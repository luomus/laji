import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsageRoutingModule } from './usage-routing.module';
import { UsageComponent } from './usage.component';


@NgModule({
  declarations: [UsageComponent],
  imports: [
    CommonModule,
    UsageRoutingModule
  ]
})
export class UsageModule { }
