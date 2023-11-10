import { NgModule } from '@angular/core';
import { AlertComponent } from './alert.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule],
  declarations: [AlertComponent],
  exports: [AlertComponent]
})
export class AlertModule { }
