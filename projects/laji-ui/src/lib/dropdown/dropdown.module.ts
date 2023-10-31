import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownToggleDirective } from './dropdown-toggle.directive';
import { DropdownMenuDirective } from './dropdown-menu.directive';



@NgModule({
  declarations: [
    DropdownToggleDirective,
    DropdownMenuDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DropdownToggleDirective,
    DropdownMenuDirective
  ],
})
export class DropdownModule { }
