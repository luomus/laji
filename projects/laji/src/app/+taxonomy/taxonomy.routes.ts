import { RouterModule, Routes, UrlMatcher, UrlSegment } from '@angular/router';
import { TaxonomyComponent } from './taxonomy.component';
import { SpeciesComponent } from './species/species.component';
import { TaxonComponent } from './taxon/taxon.component';
import { ModuleWithProviders } from '@angular/core';
import { InformalGroupRedirectComponent } from './informal-group-redirect/informal-group-redirect.component';
import { BrowseSpeciesComponent } from './browse-species/browse-species.component';

export function decideSpeciesTab(url: UrlSegment[]) {
  if (url.length === 1 && (url[0].path === 'list' || url[0].path === 'images')) {
    return { consumed: url, posParams: {tab: url[0]} };
  }
  return null;
}

const knownPrefixes = ['MX.', 'gbif:'];

export function decideTaxonTab(url: UrlSegment[]) {
  if (typeof url[0].path === 'string' && knownPrefixes.some(prefix => url[0].path.startsWith(prefix))) {
    return url.length === 1 ?
      { consumed: url, posParams: {id: url[0]} } :
      { consumed: url, posParams: {id: url[0], tab: url[1]} };
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
    matcher: <UrlMatcher | undefined>decideTaxonTab,
    component: TaxonComponent
  },
];
export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(taxonomyRoutes);
