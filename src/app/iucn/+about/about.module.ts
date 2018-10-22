import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutRoutingModule } from './about-routing.module';
import { AboutComponent } from './about.component';
import { IucnSharedModule } from '../iucn-shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    AboutRoutingModule,
    IucnSharedModule
  ],
  declarations: [AboutComponent]
})
export class AboutModule { }
