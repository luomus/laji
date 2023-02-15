import { RouterModule, Routes } from '@angular/router';
import { ProjectFormEditComponent } from './project-form-edit.component';
import { ModuleWithProviders } from '@angular/core';
import { ProjectFormModule } from '../+project-form/project-form.module';
import { OnlyLoggedIn } from '../shared/route/only-logged-in';

export const routes: Routes = [
  {
    path: '',
    canActivate: [OnlyLoggedIn],
    component: ProjectFormEditComponent,
    children: [{
      path: '',
      loadChildren: () => ProjectFormModule,
    }]
  }
];
export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
