import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteTransformerDirective } from './directive/route-transformer.directive';



@NgModule({
  declarations: [
    RouteTransformerDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    RouteTransformerDirective
  ]
})
export class UtilitiesModule { }
