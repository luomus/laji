import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LajiFormHeaderComponent } from './laji-form-header.component';
import { SharedModule } from '../../../../shared/shared.module';
import { LatestDocumentsModule } from '../../../../shared-modules/latest-documents/latest-documents.module';
import { OwnSubmissionsModule } from '../../../../shared-modules/own-submissions/own-submissions.module';

@NgModule({
  providers: [],
  imports: [
    CommonModule,
    SharedModule,
    LatestDocumentsModule,
    OwnSubmissionsModule
  ],
  declarations: [LajiFormHeaderComponent],
  exports: [LajiFormHeaderComponent]
})
export class LajiFormHeaderModule {}
