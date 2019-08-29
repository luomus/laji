import { NgModule } from '@angular/core';
import { ButtonComponent } from './button/button.component';
import { CommonModule } from '@angular/common';



@NgModule({
  declarations: [ButtonComponent],
  imports: [
    CommonModule
  ],
  exports: [ButtonComponent]
})
export class LajiUiModule { }
