import { NgModule } from '@angular/core';
import { ButtonComponent } from './button/button.component';
import { CommonModule } from '@angular/common';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { DropdownComponent } from './dropdown/dropdown.component';



@NgModule({
  declarations: [ButtonComponent, CheckboxComponent, DropdownComponent],
  imports: [
    CommonModule
  ],
  exports: [ButtonComponent, CheckboxComponent, DropdownComponent]
})
export class LajiUiModule { }
