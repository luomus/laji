import { RouterModule, Routes } from '@angular/router';
import { CitableDownloadComponent } from './citable-download.component';
import { ModuleWithProviders } from '@angular/core';

export const citableDownloadRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: CitableDownloadComponent
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(citableDownloadRoutes);
