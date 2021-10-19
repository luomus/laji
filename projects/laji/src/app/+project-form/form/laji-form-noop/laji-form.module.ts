import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { LajiFormComponent } from './laji-form/laji-form.component';
import { LajiFormHeaderComponent } from './laji-form-header/laji-form-header.component';
import { DocumentFormComponent } from './document-form/document-form.component';
import { LajiFormFooterComponent } from './laji-form-footer/laji-form-footer.component';
import { LajiFormDocumentFacade } from './laji-form-document.facade';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [LajiFormComponent, DocumentFormComponent, LajiFormHeaderComponent, LajiFormFooterComponent],
  exports: [LajiFormComponent, DocumentFormComponent, LajiFormHeaderComponent, LajiFormFooterComponent],
  providers: [LajiFormDocumentFacade]
})
export class LajiFormModule { }
