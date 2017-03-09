import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapRoutingModule } from './map-routing.module';
import { FrontComponent } from './front/front.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    MapRoutingModule,
    SharedModule
  ],
  declarations: [FrontComponent]
})
export class MapModule { }
