import { NgModule } from '@angular/core';
import { NpEditFormComponent } from './np-edit-form.component';
import { LajiFormModule } from '../../../../shared-modules/laji-form/laji-form.module';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { DocumentFormHeaderModule } from '../../../../shared-modules/laji-form/document-form-header/document-form-header.module';

@NgModule({
  providers: [],
  imports: [
    CommonModule,
    SharedModule,
    LajiFormModule,
    DocumentFormHeaderModule
  ],
  declarations: [NpEditFormComponent],
  exports: []
})
export class NpEditFormModule {}
