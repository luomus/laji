import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggedInDirective } from './directive/logged-in.directive';
import { UtilitiesDumbDirectivesModule } from './directive/dumb-directives/utilities-dumb-directives.module';

@NgModule({
  declarations: [
    LoggedInDirective
  ],
  imports: [
    CommonModule,
    UtilitiesDumbDirectivesModule
  ],
  exports: [
    LoggedInDirective,
    UtilitiesDumbDirectivesModule
  ]
})
export class UtilitiesModule { }
