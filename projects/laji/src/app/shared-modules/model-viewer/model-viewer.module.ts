import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelViewerComponent } from './model-viewer.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ ModelViewerComponent ],
  exports: [ ModelViewerComponent ]
})
export class LajiModelViewerModule { }
