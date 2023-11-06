import { NgModule } from '@angular/core';
import { PopoverDirective } from './popover.directive';
import { PopoverContainerComponent } from './popover-container.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    PopoverDirective,
    PopoverContainerComponent
  ],
  exports: [
    PopoverDirective
  ]
})
export class PopoverModule {}
