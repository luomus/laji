import { RouterModule, Routes, UrlSegment } from '@angular/router';
import { TaxonComponent } from './taxon.component';
import { TaxonBrowseComponent } from './taxon-browse/taxon-browse.component';
import { InfoCardComponent } from './info-card/info-card.component';
import { ModuleWithProviders } from '@angular/core';
import { InformalGroupRedirectComponent } from './informal-group-redirect/informal-group-redirect.component';

export function decideTaxonTab(url: UrlSegment[]) {
  if (url.length === 1) {
    if (url[0].path === 'list' || url[0].path === 'images' || url[0].path === 'tree') {
      return { consumed: url, posParams: {tab: url[0]} };
    }
  }
  return null;
}

export function decideTaxon(url: UrlSegment[]) {
  if (url.length === 1) {
    if (typeof url[0].path === 'string' && url[0].path.indexOf('MX.') === 0) {
      return { consumed: url, posParams: {id: url[0]} };
    }
  }
  return null;
}

export const taxonomyRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: TaxonComponent
  },
  {
    matcher: decideTaxonTab,
    component: TaxonBrowseComponent,
    data: {
      noScrollToTop: true
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
    matcher: decideTaxon,
    pathMatch: 'full',
    component: InfoCardComponent
  },
];
export const routing: ModuleWithProviders = RouterModule.forChild(taxonomyRoutes);
