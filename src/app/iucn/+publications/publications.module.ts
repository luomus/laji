import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicationsRoutingModule } from './publications-routing.module';
import { PublicationsComponent } from './publications.component';
import { IucnSharedModule } from '../iucn-shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    PublicationsRoutingModule,
    IucnSharedModule
  ],
  declarations: [PublicationsComponent]
})
export class PublicationsModule { }
