import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutRoutingModule } from './about-routing.module';
import { AboutComponent } from './about.component';
import { InfoPageModule } from '../../../../../src/app/shared-modules/info-page/info-page.module';
import { SharedModule } from '../../../../../src/app/shared/shared.module';
import { IucnSharedModule } from '../iucn-shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    AboutRoutingModule,
    SharedModule,
    IucnSharedModule,
    InfoPageModule
  ],
  declarations: [AboutComponent]
})
export class AboutModule { }
