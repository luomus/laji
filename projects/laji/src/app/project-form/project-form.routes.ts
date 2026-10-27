import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectFormComponent } from './project-form.component';
import { AboutComponent } from './about/about.component';
import { InstructionsComponent } from './instructions/instructions.component';
import { OnlyLoggedIn } from '../shared/route/only-logged-in';
import { AdminComponent } from './form-permission/admin/admin.component';
import { IntroComponent } from './form-permission/admin/intro/intro.component';
import { AcceptComponent } from './form-permission/admin/accept/accept.component';
import { ManageComponent } from './form-permission/admin/manage/manage.component';
import { ParticipantsComponent } from './form-permission/admin/participants/participants.component';
import { ImportComponent } from './import/import.component';
import { GenerateSpreadsheetComponent } from './generate-spreadsheet/generate-spreadsheet.component';
import { TemplatesComponent } from './templates/templates.component';
import { HasAdminPermission } from './guards/has-admin-permission';
import { HasFormPermission } from './guards/has-form-permission';
import { DisabledComponent } from './disabled/disabled.component';

export const routes: Routes = [
  {
    path: ':projectID',
    component: ProjectFormComponent,
    children : [
      {path: 'disabled', pathMatch: 'prefix', component: DisabledComponent},
      {path: 'about', pathMatch: 'prefix', component: AboutComponent},
      {path: 'instructions', pathMatch: 'prefix', component: InstructionsComponent, canActivate: [OnlyLoggedIn, HasFormPermission]},
      {path: 'stats', pathMatch: 'prefix', loadChildren: () => import('./results/results.module').then(m => m.ResultsModule)},
      {
        path: 'submissions',
        pathMatch: 'prefix',
        canActivate: [OnlyLoggedIn, HasFormPermission],
        loadChildren: () => import('./submissions/submissions.module').then(m => m.SubmissionsModule)
      },
      {path: 'form', pathMatch: 'prefix', loadChildren: () => import('./form/form.module').then(m => m.FormModule)},
      {
        path: 'admin',
        pathMatch: 'prefix',
        canActivate: [OnlyLoggedIn, HasAdminPermission],
        component: AdminComponent,
        children: [
          {path: '',pathMatch: 'prefix',  redirectTo: 'instructions'},
          {path: 'instructions',pathMatch: 'prefix',  component: IntroComponent},
          {path: 'accept', pathMatch: 'full', component: AcceptComponent},
          {path: 'manage/:type', pathMatch: 'full', component: ManageComponent},
          {path: 'participants', pathMatch: 'full', component: ParticipantsComponent},
        ]
      },
      {
        path: 'import',
        pathMatch: 'prefix',
        canActivate: [OnlyLoggedIn, HasFormPermission],
        component: ImportComponent
      },
      {
        path: 'generate',
        pathMatch: 'prefix',
        canActivate: [OnlyLoggedIn, HasFormPermission],
        component: GenerateSpreadsheetComponent
      },
      {
        path: 'templates',
        pathMatch: 'prefix',
        canActivate: [OnlyLoggedIn, HasFormPermission],
        component: TemplatesComponent
      }
    ]
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
