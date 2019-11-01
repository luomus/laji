import { NgModule } from '@angular/core';
import { ButtonComponent } from './button/button.component';
import { CommonModule } from '@angular/common';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { TabsComponent } from './tabs/tabs.component';
import { TabComponent } from './tabs/tab/tab.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SidebarLinkComponent } from './sidebar/sidebar-link/sidebar-link.component';
import { RouterModule } from '@angular/router';
import { GhostParagraphComponent } from './ghosts/ghost-paragraph/ghost-paragraph.component';

@NgModule({
  declarations: [
    ButtonComponent, CheckboxComponent, DropdownComponent, TabsComponent, TabComponent, SidebarComponent,
    SidebarLinkComponent, GhostParagraphComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    ButtonComponent, CheckboxComponent, DropdownComponent, TabsComponent, TabComponent, SidebarComponent,
    SidebarLinkComponent, GhostParagraphComponent
  ]
})
export class LajiUiModule { }
