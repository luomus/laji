import { NgModule } from '@angular/core';
import { NpEditFormComponent } from './np-edit-form.component';
import { LajiFormModule } from '../../laji-form/laji-form.module';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../../shared/shared.module';
import { ProjectFormHeaderModule } from '../../../header/project-form-header.module';

@NgModule({
  providers: [],
  imports: [
    CommonModule,
    SharedModule,
    LajiFormModule,
    ProjectFormHeaderModule
  ],
  declarations: [NpEditFormComponent],
  exports: []
})
export class NpEditFormModule {}
