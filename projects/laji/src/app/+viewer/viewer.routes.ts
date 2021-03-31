import { RouterModule, Routes } from '@angular/router';
import { ViewerComponent } from './viewer.component';
import { ViewerPrintComponent } from './viewer-print/viewer-print.component';
import { ViewerMediaComponent } from './viewer-media/viewer-media.component';
import { ModuleWithProviders } from '@angular/core';
import { OnlyLoggedIn } from '../shared/route/only-logged-in';

export const viewerRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ViewerComponent
  },
  {
    path: 'media',
    pathMatch: 'full',
    component: ViewerMediaComponent
  },
  {
    path: 'print',
    pathMatch: 'full',
    canActivate: [OnlyLoggedIn],
    component: ViewerPrintComponent
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(viewerRoutes);
