import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { LajiFormComponent } from './laji-form/laji-form.component';
import { DocumentFormHeaderComponent } from './document-form-header/document-form-header.component';
import { DocumentFormComponent } from './document-form/document-form.component';
import { DocumentFormFooterComponent } from './document-form-footer/document-form-footer.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [LajiFormComponent, DocumentFormComponent, DocumentFormHeaderComponent, DocumentFormFooterComponent],
  exports: [LajiFormComponent, DocumentFormComponent, DocumentFormHeaderComponent, DocumentFormFooterComponent]
})
export class LajiFormModule { }
