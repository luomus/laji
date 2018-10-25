import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IucnClassComponent } from './component/iucn-class/iucn-class.component';
import { InfoPageComponent } from './component/info-page/info-page.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [IucnClassComponent, InfoPageComponent],
  exports: [IucnClassComponent, InfoPageComponent]
})
export class IucnSharedModule { }
