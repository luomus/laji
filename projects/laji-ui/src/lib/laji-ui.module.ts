import { NgModule } from '@angular/core';
import { ButtonComponent } from './button/button.component';
import { CommonModule } from '@angular/common';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { TabsComponent } from './tabs/tabs.component';
import { TabComponent } from './tabs/tab/tab.component';



@NgModule({
  declarations: [ButtonComponent, CheckboxComponent, DropdownComponent, TabsComponent, TabComponent],
  imports: [
    CommonModule
  ],
  exports: [ButtonComponent, CheckboxComponent, DropdownComponent, TabsComponent, TabComponent]
})
export class LajiUiModule { }
