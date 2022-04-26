import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteTransformerDirective } from './route-transformer.directive';
import { ServerOnlyDirective } from './server-only.directive';
import { ForTypesDirective } from './for-types.directive';
import { BrowserOnlyDirective } from './browser-only.directive';


@NgModule({
  declarations: [
    RouteTransformerDirective,
    ServerOnlyDirective,
    ForTypesDirective,
    BrowserOnlyDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    RouteTransformerDirective,
    ServerOnlyDirective,
    ForTypesDirective,
    BrowserOnlyDirective
  ]
})
export class UtilitiesDumbDirectivesModule { }
