import { NgModule } from '@angular/core';
import { ViewerComponent } from './viewer.component';
import { SharedModule } from '../shared/shared.module';
import { DocumentComponent } from './document/document.component';
import { LevelComponent } from './level/level.component';
import { ImagesComponent } from './images/images.component';
import { ViewerMapComponent } from './viewer-map/viewer-map.component';
import { RowComponent } from './row/row.component';
import { GatheringComponent } from './gathering/gathering.component';
import { UnitComponent } from './unit/unit.component';

@NgModule({
  imports: [
    SharedModule
  ],
  declarations: [ViewerComponent, DocumentComponent, LevelComponent, ImagesComponent, ViewerMapComponent, RowComponent,
    GatheringComponent, UnitComponent],
  exports: [ViewerComponent, DocumentComponent]
})
export class ViewerModule { }
