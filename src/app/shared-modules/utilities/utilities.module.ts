import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteTransformerDirective } from './directive/route-transformer.directive';
import { LoggedInDirective } from './directive/logged-in.directive';
import { ServerOnlyDirective } from './directive/server-only.directive';
import { BrowserOnlyDirective } from './directive/browser-only.directive';
import { ForTypesDirective } from './directive/for-types.directive';


@NgModule({
  declarations: [
    RouteTransformerDirective,
    LoggedInDirective,
    ServerOnlyDirective,
    BrowserOnlyDirective,
    ForTypesDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    RouteTransformerDirective,
    LoggedInDirective,
    ServerOnlyDirective,
    BrowserOnlyDirective,
    ForTypesDirective
  ]
})
export class UtilitiesModule { }
