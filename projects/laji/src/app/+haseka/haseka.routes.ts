import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { HasekaComponent } from './haseka.component';
import { OwnSubmissionsComponent } from './own-submissions/own-submissions.component';
import { TemplatesComponent } from './templates/templates.component';
import { OnlyLoggedIn } from '../shared/route/only-logged-in';
import { VihkoHomeComponent } from './vihko-home/vihko-home.component';

export const hasekaRoutes: Routes = [
  {
    path: '',
    component: HasekaComponent,
    children: [
      {path: '', pathMatch: 'full', redirectTo: 'home'},
      {path: 'home', pathMatch: 'full', component: VihkoHomeComponent},
      {path: 'forms', pathMatch: 'full', redirectTo: 'home'},
      {path: 'ownSubmissions', pathMatch: 'full', canActivate: [OnlyLoggedIn], component: OwnSubmissionsComponent},
      {path: 'templates', pathMatch: 'full', canActivate: [OnlyLoggedIn], component: TemplatesComponent},
      {path: 'tools',  canActivate: [OnlyLoggedIn], loadChildren: () => import('./tools/tools.module').then(m => m.ToolsModule)},
    ],
  },
  {
    path: 'terms-of-service',
    pathMatch: 'full',
    redirectTo: '/about/5809'
  },
  {
    path: 'template',
    children: [
      {
        path: ':formId',
        pathMatch: 'full',
        redirectTo: '/project/:formId/form/template'
      }
    ]
  },
  {
    path: ':formId',
    pathMatch: 'full',
    redirectTo: '/project/:formId'
  },
  {
    path: ':formId/:documentId',
    pathMatch: 'full',
    redirectTo: '/project/:formId/form/:documentId'
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(hasekaRoutes);
