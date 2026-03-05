import { NgModule } from '@angular/core';
import { RouterModule, Routes, UrlMatcher } from '@angular/router';
import { NotFoundComponent } from '../../../laji/src/app/shared/not-found/not-found.component';

const supportedLangs = new Set(['en', 'fi', 'sv']);

export const langMatcher: UrlMatcher = (segments) => {
  if (!segments.length) {
    return null;
  }
  const first = segments[0].path;
  if (!supportedLangs.has(first)) {
    return null;
  }

  return {
    consumed: [segments[0]],
    //posParams: { lang: segments[0] },
  };
};

const routes: Routes = [
  {path: '', pathMatch: 'full', loadChildren: () => import('./+home/home.module').then(m => m.HomeModule)},
  {path: 'species', loadChildren: () => import('./+species/species.module').then(m => m.SpeciesModule)},
  {path: 'grid', loadChildren: () => import('./+grid/grid.module').then(m => m.GridModule)},
  {path: 'society', loadChildren: () => import('./+bird-society/bird-society.module').then(m => m.BirdSocietyModule)},
  {path: 'observers', loadChildren: () => import('./+observers/observers.module').then(m => m.ObserversModule)},
];

const routesWithLang: Routes = [
  {
    matcher: langMatcher,
    children: routes,
  },
  {
    path: '',
    children: routes,
  },
  {path: '**', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routesWithLang)],
  exports: [RouterModule]
})
export class BaRoutingModule { }
