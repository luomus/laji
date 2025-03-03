import { NgModule } from '@angular/core';
import { ButtonComponent } from './button/button.component';
import { CommonModule } from '@angular/common';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { TabsComponent } from './tabs/tabs.component';
import { TabComponent } from './tabs/tab/tab.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SidebarLinkComponent } from './sidebar/sidebar-link/sidebar-link.component';
import { RouterModule } from '@angular/router';
import { GhostParagraphComponent } from './ghosts/ghost-paragraph/ghost-paragraph.component';
import { FillHeightDirective } from './directives/fill-height.directive';
import { GhostTextContentDirective } from './directives/ghost-textcontent.directive';
import { IconComponent } from './icon/icon.component';
import { ButtonRoundComponent } from './button-round/button-round.component';
import { MessageComponent } from './message/message.component';
import { ComboCheckboxComponent } from './combo-checkbox/combo-checkbox.component';
import { ComboCheckboxRowComponent } from './combo-checkbox/combo-checkbox-row.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { KeyboardClickableDirective } from './directives/keyboard-clickable.directive';
import { CloseOnEscDirective } from './directives/close-on-esc.directive';
import { FormPrimitiveListComponent } from './forms/primitive-list/primitive-list.component';

@NgModule({
  declarations: [
    ButtonComponent, CheckboxComponent, TabsComponent, TabComponent, SidebarComponent,
    SidebarLinkComponent, GhostParagraphComponent, FillHeightDirective, GhostTextContentDirective, IconComponent, ButtonRoundComponent, MessageComponent,
    ComboCheckboxComponent, ComboCheckboxRowComponent, ClickOutsideDirective, KeyboardClickableDirective, CloseOnEscDirective, FormPrimitiveListComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    ButtonComponent, ButtonRoundComponent, CheckboxComponent, TabsComponent, TabComponent, SidebarComponent,
    SidebarLinkComponent, GhostParagraphComponent, FillHeightDirective, GhostTextContentDirective, IconComponent, MessageComponent,
    ComboCheckboxComponent, ComboCheckboxRowComponent, KeyboardClickableDirective, CloseOnEscDirective, FormPrimitiveListComponent
  ]
})
export class LajiUiModule { }
