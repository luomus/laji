import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { LajiFormComponent } from './laji-form/laji-form.component';
import { DocumentFormHeaderComponent } from './document-form-header/document-form-header.component';
import { DocumentFormComponent } from './document-form/document-form.component';
import { DocumentFormFooterComponent } from './document-form-footer/document-form-footer.component';
import { OwnSubmissionsModule } from '../own-submissions/own-submissions.module';
import { LatestDocumentsModule } from '../latest-documents/latest-documents.module';
import { AppComponentModule } from '../app-component/app-component.module';
import { InfoPageModule } from '../info-page/info-page.module';
import { LajiFormDocumentFacade } from './laji-form-document.facade';
import { LajiUiModule } from '../../../../../laji-ui/src/lib/laji-ui.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    OwnSubmissionsModule,
    LatestDocumentsModule,
    AppComponentModule,
    InfoPageModule,
    LajiUiModule
  ],
  declarations: [LajiFormComponent, DocumentFormComponent, DocumentFormHeaderComponent, DocumentFormFooterComponent],
  exports: [LajiFormComponent, DocumentFormComponent, DocumentFormHeaderComponent, DocumentFormFooterComponent],
  providers: [LajiFormDocumentFacade]
})
export class LajiFormModule { }
