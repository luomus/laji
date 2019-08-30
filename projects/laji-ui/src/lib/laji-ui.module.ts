import { NgModule } from '@angular/core';
import { ButtonComponent } from './button/button.component';
import { CommonModule } from '@angular/common';
import { CheckboxComponent } from './checkbox/checkbox.component';



@NgModule({
  declarations: [ButtonComponent, CheckboxComponent],
  imports: [
    CommonModule
  ],
  exports: [ButtonComponent, CheckboxComponent]
})
export class LajiUiModule { }
