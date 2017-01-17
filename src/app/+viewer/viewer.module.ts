import { NgModule } from '@angular/core';
import { ViewerComponent } from './viewer.component';
import { SharedModule } from '../shared/shared.module';
import { DocumentComponent } from './document/document.component';
import { LevelComponent } from './level/level.component';
import { ImagesComponent } from './images/images.component';
import { ViewerMapComponent } from './viewer-map/viewer-map.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [ViewerComponent, DocumentComponent, LevelComponent, ImagesComponent, ViewerMapComponent],
  exports: [ViewerComponent]
})
export class ViewerModule { }
