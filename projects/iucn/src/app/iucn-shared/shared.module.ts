import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IucnClassComponent } from './component/iucn-class/iucn-class.component';
import { SharedModule } from '../../../../../src/app/shared/shared.module';
import { IucnStatusPipe } from './pipe/iucn-status.pipe';
import { IucnHyphensPipe } from './pipe/iucn-hyphens.pipe';

@NgModule({
  imports: [
    SharedModule,
    CommonModule
  ],
  declarations: [IucnClassComponent, IucnStatusPipe, IucnHyphensPipe],
  exports: [IucnClassComponent, IucnStatusPipe]
})
export class IucnSharedModule { }
