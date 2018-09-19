import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IucnClassComponent } from './component/iucn-class/iucn-class.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [IucnClassComponent],
  exports: [IucnClassComponent]
})
export class IucnSharedModule { }
