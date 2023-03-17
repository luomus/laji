import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelViewerComponent } from './model-viewer.component';
import { ModelViewerService } from './model-viewer.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [ ModelViewerService ],
  declarations: [ ModelViewerComponent ],
  exports: [ ModelViewerComponent ]
})
export class LajiModelViewerModule { }
