import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicationsRoutingModule } from './publications-routing.module';
import { PublicationsComponent } from './publications.component';
import { InfoPageModule } from '../../../../../src/app/shared-modules/info-page/info-page.module';

@NgModule({
  imports: [
    CommonModule,
    PublicationsRoutingModule,
    InfoPageModule
  ],
  declarations: [PublicationsComponent]
})
export class PublicationsModule { }
