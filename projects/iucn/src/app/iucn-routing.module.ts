/* eslint-disable max-classes-per-file */
import { Injectable, NgModule } from '@angular/core';
import { PreloadingStrategy, ResolveFn, Route, RouterModule, Routes } from '@angular/router';
import { Observable, of as ObservableOf, timer as ObservableTimer } from 'rxjs';
import { LocaleEnComponent } from '../../../laji/src/app/locale/locale-en.component';
import { LocaleSvComponent } from '../../../laji/src/app/locale/locale-sv.component';
import { LocaleFiComponent } from '../../../laji/src/app/locale/locale-fi.component';
import { catchError, flatMap } from 'rxjs';
import { NotFoundComponent } from '../../../laji/src/app/shared/not-found/not-found.component';
import { CheckLoginGuard } from 'projects/laji/src/app/shared/guards/check-login.guard';
import { setLocale } from 'projects/laji/src/app/app-routing.modules';

const localeResolver = (lang: string): ResolveFn<boolean> => () => setLocale(lang);

@Injectable()
export class PreloadSelectedModulesList implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    const loadRoute = () => ObservableTimer(50).pipe(flatMap(() => load()), catchError(() => ObservableOf(null)));

    return route.data && route.data.preload ? loadRoute() : ObservableOf(null);
  }
}

const baseRoutes: Routes = [
  {path: '', pathMatch: 'full', loadChildren: () => import('./home/iucn-home.module').then(m => m.IucnHomeModule), data: {preload: true}},
  {path: 'about', loadChildren: () => import('./about/about.module').then(m => m.AboutModule), data: {title: 'iucn.about.title'}},
  {path: 'regional', loadChildren: () => import('./regional/regional.module')
      .then(m => m.RegionalModule), data: {title: 'iucn.regional.title'}},
  {path: 'publications', loadChildren: () => import('./publications/publications.module')
      .then(m => m.PublicationsModule), data: {title: 'iucn.publications.title'}},
  {path: 'user', loadChildren: () => import('../../../laji/src/app/user/user.module').then(m => m.UserModule)},
  {path: 'view', loadChildren: () => import('../../../laji/src/app/viewer/viewer.module')
      .then(m => m.ViewerModule), data: {title: 'viewer.document'}},
  {path: 'results', loadChildren: () => import('./taxonomy/iucn-taxonomy.module').then(m => m.IucnTaxonomyModule), data: {preload: true}},
];

const routesWithLang: Routes = [
  {path: 'en', children: [
      ...baseRoutes,
      {path: '**', component: NotFoundComponent}
    ], component: LocaleEnComponent, resolve: { localeReady: localeResolver('en') }},
  {path: 'sv', children: [
      ...baseRoutes,
      {path: '**', component: NotFoundComponent}
    ], component: LocaleSvComponent, resolve: { localeReady: localeResolver('sv') }},
  {path: '', children: [
      ...baseRoutes,
      {path: '**', component: NotFoundComponent}
    ], component: LocaleFiComponent, resolve: { localeReady: localeResolver('fi') }}
];

export const routes: Routes = [
  {
    path: '',
    children: routesWithLang,
    canActivate: [CheckLoginGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false,
    preloadingStrategy: PreloadSelectedModulesList,
})],
  exports: [RouterModule],
  providers: [PreloadSelectedModulesList]
})
export class IucnRoutingModule { }
