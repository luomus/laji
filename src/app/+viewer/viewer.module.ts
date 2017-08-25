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
import { ToQNamePipe } from '../shared/pipe/to-qname.pipe';
import { LcFirstPipe } from './pipe/lc-first.pipe';
import { AnnotationsComponent } from './annotations/annotations.component';
import { AnnotationFormComponent } from './annotations/annotation-form/annotation-form.component';
import { AnnotationListComponent } from './annotations/annotation-list/annotation-list.component';
import { AnnotationService } from './service/annotation.service';
import { AnnotationApi } from '../shared/api/AnnotationApi';
import { TypeaheadModule } from 'ngx-bootstrap';
import { SecureInfoComponent } from './secure-info/secure-info.component';

@NgModule({
  imports: [
    SharedModule,
    TypeaheadModule
  ],
  providers: [ToQNamePipe, AnnotationService, AnnotationApi],
  declarations: [ViewerComponent, DocumentComponent, LevelComponent, ImagesComponent, ViewerMapComponent, RowComponent,
    GatheringComponent, UnitComponent, LcFirstPipe, AnnotationsComponent, AnnotationFormComponent, AnnotationListComponent, SecureInfoComponent],
  exports: [ViewerComponent, DocumentComponent]
})
export class ViewerModule { }
