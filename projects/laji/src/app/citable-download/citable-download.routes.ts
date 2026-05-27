import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { CitableDownloadComponent } from './citable-download.component';
import { NotFoundComponent } from '../shared/not-found/not-found.component';

export const citableDownloadRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: NotFoundComponent
  },
  {
    path: ':id',
    pathMatch: 'full',
    component: CitableDownloadComponent
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(citableDownloadRoutes);
