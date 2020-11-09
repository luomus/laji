import { NgModule } from '@angular/core';
import { routing } from './project-form-edit.routes';
import { ProjectFormEditComponent } from './project-form-edit.component';
import { LajiFormBuilderComponent } from './laji-form-builder.component';

@NgModule({
  imports: [
    routing,
  ],
  declarations: [
    ProjectFormEditComponent,
    LajiFormBuilderComponent
  ]
})
export class ProjectFormEditModule {
}
