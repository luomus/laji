import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressbarComponent } from './progressbar/progressbar.component';

@NgModule({
  declarations: [
    ProgressbarComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ProgressbarComponent
  ]
})
export class ProgressbarModule { }
