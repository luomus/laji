import { NgModule } from '@angular/core';
import { ViewerComponent } from './viewer.component';
import { SharedModule } from '../shared/shared.module';
import { ViewerPrintComponent } from './viewer-print/viewer-print.component';
import { DocumentViewerModule } from '../shared-modules/document-viewer/document-viewer.module';
import { routing } from './viewer.routes';

@NgModule({
  imports: [
    routing,
    SharedModule,
    DocumentViewerModule
  ],
  providers: [],
  declarations: [ViewerComponent, ViewerPrintComponent]
})
export class ViewerModule { }
