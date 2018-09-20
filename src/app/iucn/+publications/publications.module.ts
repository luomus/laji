import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicationsRoutingModule } from './publications-routing.module';
import { PublicationsComponent } from './publications.component';

@NgModule({
  imports: [
    CommonModule,
    PublicationsRoutingModule
  ],
  declarations: [PublicationsComponent]
})
export class PublicationsModule { }
