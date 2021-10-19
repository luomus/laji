import { NgModule } from '@angular/core';
import { NpEditFormComponent } from './np-edit-form.component';
import { LajiFormModule } from '../../laji-form/laji-form.module';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { LajiFormHeaderModule } from '@laji-form/laji-form-header/laji-form-header.module';

@NgModule({
  providers: [],
  imports: [
    CommonModule,
    SharedModule,
    LajiFormModule,
    LajiFormHeaderModule
  ],
  declarations: [NpEditFormComponent],
  exports: []
})
export class NpEditFormModule {}
