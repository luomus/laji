import { Routes, RouterModule } from '@angular/router';
import { TaxonComponent } from './taxon.component';
import { InfoCardComponent } from './info-card/info-card.component';
import { ModuleWithProviders } from '@angular/core';

export const taxonomyRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'browse/informal'
  },
  {
    path: 'browse/taxonomy',
    pathMatch: 'full',
    redirectTo: 'browse/taxonomy/MX.53761'
  },
  {
    path: 'browse/taxonomy/',
    pathMatch: 'full',
    redirectTo: 'browse/taxonomy/MX.53761'
  },
  {
    path: 'browse/:type',
    pathMatch: 'full',
    component: TaxonComponent
  },
  {
    path: 'browse/:type/:id',
    pathMatch: 'full',
    component: TaxonComponent
  },
  {
    path: ':id',
    pathMatch: 'full',
    component: InfoCardComponent
  },
];
export const routing: ModuleWithProviders = RouterModule.forChild(taxonomyRoutes);
