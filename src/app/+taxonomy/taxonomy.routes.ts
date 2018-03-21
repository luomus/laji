import { RouterModule, Routes, UrlSegment } from '@angular/router';
import { TaxonComponent } from './taxon.component';
import { InformalComponent } from './informal/informal.component';
import { InfoCardComponent } from './info-card/info-card.component';
import { ModuleWithProviders } from '@angular/core';

export function decideTaxonFront(url: UrlSegment[]) {
  if (url.length === 1) {
    if (url[0].path.startsWith('informal')) {
      return {consumed: url, posParams: {'type': new UrlSegment('informal', {})}};
    } else if (url[0].path.startsWith('taxonomy')) {
      return {consumed: url, posParams: {'type': new UrlSegment('taxonomy', {})}};
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
    matcher: decideTaxonFront,
    component: TaxonComponent
  },
  {
    path: 'informal/:id',
    pathMatch: 'full',
    component: InformalComponent
  },
  {
    path: 'taxonomy/:id',
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
