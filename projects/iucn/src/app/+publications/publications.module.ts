import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicationsRoutingModule } from './publications-routing.module';
import { PublicationsComponent } from './publications.component';
import { InfoPageModule } from '../../../../../src/app/shared-modules/info-page/info-page.module';
import { IucnSharedModule } from '../iucn-shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    PublicationsRoutingModule,
    InfoPageModule,
    IucnSharedModule
  ],
  declarations: [PublicationsComponent]
})
export class PublicationsModule { }
