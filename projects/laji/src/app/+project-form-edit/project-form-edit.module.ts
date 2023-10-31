import { NgModule } from '@angular/core';
import { routing } from './project-form-edit.routes';
import { LajiFormBuilderModule } from '@laji-form-builder/laji-form-builder.module';
import { ProjectFormEditComponent } from './project-form-edit.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    routing,
    SharedModule,
    LajiFormBuilderModule
  ],
  declarations: [
    ProjectFormEditComponent
  ]
})
export class ProjectFormEditModule {
}
