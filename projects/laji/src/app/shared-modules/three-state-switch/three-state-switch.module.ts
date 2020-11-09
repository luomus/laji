import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThreeStateSwitchComponent } from './three-state-switch.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    ThreeStateSwitchComponent
  ],
  providers: [],
  exports: [
    ThreeStateSwitchComponent
  ]
})
export class ThreeStateSwitchModule { }
