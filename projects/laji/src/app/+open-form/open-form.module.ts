import { NgModule } from '@angular/core';
import { routing } from './open-form.routes';
import { OpenFormComponent } from './open-form/open-form.component';
import { OpenFormThankYouComponent } from './open-form-thank-you/open-form-thank-you.component';
import { DocumentViewerModule } from '../shared-modules/document-viewer/document-viewer.module';
import { LajiFormModule } from '../+project-form/form/laji-form/laji-form.module';
import { SpinnerModule } from '../shared-modules/spinner/spinner.module';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    routing,
    CommonModule,
    SharedModule,
    DocumentViewerModule,
    LajiFormModule,
    SpinnerModule
  ],
  declarations: [
    OpenFormComponent,
    OpenFormThankYouComponent
  ]
})
export class OpenFormModule {
}
