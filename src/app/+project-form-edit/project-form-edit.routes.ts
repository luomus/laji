import { RouterModule, Routes } from '@angular/router';
import { ProjectFormEditComponent } from './project-form-edit.component';
import { ModuleWithProviders } from '@angular/core';
import { ProjectFormModule } from '../+project-form/project-form.module';

export const routes: Routes = [
  {
    path: '',
    component: ProjectFormEditComponent,
    children: [{
      path: '',
      loadChildren: () => ProjectFormModule,
    }]
  }
]
export const routing: ModuleWithProviders = RouterModule.forChild(routes);
