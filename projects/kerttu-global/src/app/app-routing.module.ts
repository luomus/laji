/* eslint-disable max-classes-per-file */
import { Injectable, NgModule } from '@angular/core';
import { PreloadingStrategy, ResolveFn, Route, RouterModule, Routes } from '@angular/router';
import { Observable, of as ObservableOf, timer as ObservableTimer } from 'rxjs';
import { LocaleEnComponent } from '../../../laji/src/app/locale/locale-en.component';
import { catchError, flatMap } from 'rxjs';
import { NotFoundComponent } from '../../../laji/src/app/shared/not-found/not-found.component';
import { CheckLoginGuard } from '../../../laji/src/app/shared/guards/check-login.guard';
import { LocaleEsComponent } from './locale/locale-es.component';
import { LocaleFrComponent } from './locale/locale-fr.component';
import { LocaleZhComponent } from './locale/locale-zh.component';
import { setLocale } from 'projects/laji/src/app/app-routing.modules';
import { mapTo, take } from 'rxjs/operators';

@Injectable()
export class PreloadSelectedModulesList implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    const loadRoute = () => ObservableTimer(50).pipe(flatMap(() => load()), catchError(() => ObservableOf(null)));

    return route.data && route.data.preload ? loadRoute() : ObservableOf(null);
  }
}

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./about/about.module').then(m => m.AboutModule),
    data: {preload: true, title: 'Bird & Bat Sounds Global'}
  },
  {
    path: 'validation',
    loadChildren: () => import('./validation/validation.module').then(m => m.ValidationModule),
    data: {title: 'Bird & Bat Sounds Global'}
  },
  {
    path: 'identification',
    loadChildren: () => import('./identification/identification.module').then(m => m.IdentificationModule),
    data: {title: 'Bird & Bat Sounds Global'}
  },
  {
    path: 'bats/identification',
    loadChildren: () => import('./bat-identification/bat-identification.module').then(m => m.BatIdentificationModule),
    data: {title: 'Bird & Bat Sounds Global'}
  },
  {
    path: 'user',
    loadChildren: () => import('../../../laji/src/app/user/user.module').then(m => m.UserModule)
  }
];

const localeResolver = (lang: string): ResolveFn<boolean> => () => setLocale(lang).pipe(
  take(1),
  mapTo(true)
);

const routesWithLang: Routes = [
  {path: 'es', children: [
      ...routes,
      {path: '**', component: NotFoundComponent}
    ], component: LocaleEsComponent, resolve: { localeReady: localeResolver('es') }},
  {path: 'fr', children: [
      ...routes,
      {path: '**', component: NotFoundComponent}
    ], component: LocaleFrComponent, resolve: { localeReady: localeResolver('fr') }},
  {path: '', children: [
      ...routes,
    ], component: LocaleEnComponent, resolve: { localeReady: localeResolver('en') }}
];

const allRoutes: Routes = [
  {path: '', children: routesWithLang, canActivate: [CheckLoginGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(allRoutes, {
    enableTracing: false,
    preloadingStrategy: PreloadSelectedModulesList,
})],
  exports: [RouterModule],
  providers: [PreloadSelectedModulesList]
})
export class AppRoutingModule { }
