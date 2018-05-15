import { RouterModule, Routes, UrlSegment } from '@angular/router';
import { TaxonComponent } from './taxon.component';
import { InformalComponent } from './informal/informal.component';
import { InfoCardComponent } from './info-card/info-card.component';
import { ModuleWithProviders } from '@angular/core';

export function decideTaxonFront(url: UrlSegment[]) {
  if (url.length === 1) {
    if (url[0].path.endsWith('list')) {
      return {consumed: url, posParams: {'type': new UrlSegment('list', {})}};
    } else if (url[0].path.endsWith('tree')) {
      return {consumed: url, posParams: {'type': new UrlSegment('tree', {})}};
    }
  }
  return null;
}

export const taxonomyRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'informal'
  },
  {
    path: 'informal',
    component: TaxonComponent
  },
  {
    matcher: decideTaxonFront,
    component: InformalComponent
  },
  {
    path: 'informal/:type',
    pathMatch: 'full',
    component: InformalComponent
  },
  {
    path: ':id',
    pathMatch: 'full',
    component: InfoCardComponent
  },
];
export const routing: ModuleWithProviders = RouterModule.forChild(taxonomyRoutes);
