import { NgModule } from '@angular/core';
import { ViewerComponent } from './viewer.component';
import { SharedModule } from '../shared/shared.module';
import { ViewerPrintComponent } from './viewer-print/viewer-print.component';
import { DocumentViewerModule } from '../shared-modules/document-viewer/document-viewer.module';
import { routing } from './viewer.routes';
import { LicenseModule } from '../shared-modules/license/license.module';

@NgModule({
  imports: [
    routing,
    SharedModule,
    DocumentViewerModule,
    LicenseModule
  ],
  providers: [],
  declarations: [ViewerComponent, ViewerPrintComponent]
})
export class ViewerModule { }
