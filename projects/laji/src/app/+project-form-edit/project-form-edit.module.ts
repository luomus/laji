import { NgModule } from '@angular/core';
import { routing } from './project-form-edit.routes';
import { ProjectFormEditComponent } from './project-form-edit.component';
import { LajiFormBuilderComponent } from './laji-form-builder.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    routing,
    SharedModule,
  ],
  declarations: [
    ProjectFormEditComponent,
    LajiFormBuilderComponent
  ]
})
export class ProjectFormEditModule {
}
