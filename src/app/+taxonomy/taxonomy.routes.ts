import { Routes, RouterModule, UrlSegment } from '@angular/router';
import { TaxonComponent } from './taxon.component';
import { InfoCardComponent } from './info-card/info-card.component';
import { ModuleWithProviders } from '@angular/core';

const typeMatcher = function htmlFiles(url: UrlSegment[]) {
  if (url.length === 1) {
    if (url[0].path.startsWith('informal')) {
      return {consumed: url, posParams: {'type': new UrlSegment('informal', {})}};
    } else if (url[0].path.startsWith('taxonomy')) {
      return {consumed: url, posParams: {'type': new UrlSegment('taxonomy', {})}};
    }
  }
  return null;
};

export const taxonomyRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'informal'
  },
  {
    matcher: typeMatcher,
    component: TaxonComponent
  },
  {
    path: ':type/:id',
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
