import { RouterModule, Routes } from '@angular/router';
import { TaxonComponent } from './taxon.component';
import { TaxonBrowseComponent } from './taxon-browse/taxon-browse.component';
import { InfoCardComponent } from './info-card/info-card.component';
import { ModuleWithProviders } from '@angular/core';
import { InformalGroupRedirectComponent } from './informal-group-redirect/informal-group-redirect.component';

export const taxonomyRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: TaxonComponent
  },
  {
    path: 'list',
    pathMatch: 'full',
    component: TaxonBrowseComponent,
    data: {
      type: 'list'
    }
  },
  {
    path: 'images',
    pathMatch: 'full',
    component: TaxonBrowseComponent,
    data: {
      type: 'images'
    }
  },
  {
    path: 'tree',
    pathMatch: 'full',
    component: TaxonBrowseComponent,
    data: {
      type: 'tree'
    }
  },
  {
    path: 'informal',
    redirectTo: 'list'
  },
  {
    path: 'informal/:id',
    component: InformalGroupRedirectComponent
  },
  {
    path: ':id',
    pathMatch: 'full',
    component: InfoCardComponent
  },
];
export const routing: ModuleWithProviders = RouterModule.forChild(taxonomyRoutes);
