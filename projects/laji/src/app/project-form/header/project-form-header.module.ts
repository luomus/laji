import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectFormHeaderComponent } from './project-form-header.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  providers: [],
  imports: [
    CommonModule,
    SharedModule,
  ],
  declarations: [ProjectFormHeaderComponent],
  exports: [ProjectFormHeaderComponent]
})
export class ProjectFormHeaderModule {}
