import { RouterModule, Routes, UrlSegment } from '@angular/router';
import { TaxonomyComponent } from './taxonomy.component';
import { SpeciesComponent } from './species/species.component';
import { TaxonComponent } from './taxon/taxon.component';
import { ModuleWithProviders } from '@angular/core';
import { InformalGroupRedirectComponent } from './informal-group-redirect/informal-group-redirect.component';
import { BrowseSpeciesComponent } from './browse-species/browse-species.component';

export function decideSpeciesTab(url: UrlSegment[]) {
  if (url.length === 1) {
    if (url[0].path === 'list' || url[0].path === 'images') {
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
    component: TaxonomyComponent
  },
  {
    path: 'browse',
    pathMatch: 'full',
    component: BrowseSpeciesComponent
  },
  {
    matcher: decideSpeciesTab,
    component: SpeciesComponent,
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
    component: TaxonComponent
  },
];
export const routing: ModuleWithProviders = RouterModule.forChild(taxonomyRoutes);
