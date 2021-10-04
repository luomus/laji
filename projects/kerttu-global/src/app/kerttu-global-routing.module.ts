/* tslint:disable:max-classes-per-file */
import { Injectable, NgModule } from '@angular/core';
import { PreloadingStrategy, Route, RouterModule, Routes } from '@angular/router';
import { Observable, of as ObservableOf, timer as ObservableTimer } from 'rxjs';
import { LocaleEnComponent } from '../../../laji/src/app/locale/locale-en.component';
import { LocaleSvComponent } from '../../../laji/src/app/locale/locale-sv.component';
import { LocaleFiComponent } from '../../../laji/src/app/locale/locale-fi.component';
import { catchError, flatMap } from 'rxjs/operators';
import { LocalizeGuard } from '../../../laji/src/app/locale/localize.guard';
import { NotFoundComponent } from '../../../laji/src/app/shared/not-found/not-found.component';
import { CheckLoginGuard } from '../../../laji/src/app/shared/guards/check-login.guard';
import { OnlyLoggedIn } from 'projects/laji/src/app/shared/route/only-logged-in';

@Injectable()
export class PreloadSelectedModulesList implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    const loadRoute = () => ObservableTimer(50).pipe(flatMap(() => load()), catchError(() => ObservableOf(null)));

    return route.data && route.data.preload ? loadRoute() : ObservableOf(null);
  }
}

const routes: Routes = [
  {path: '', pathMatch: 'full', loadChildren: () => import('./+about/about.module').then(m => m.AboutModule), data: {preload: true, title: 'Bird Sounds Global'}},
  {
    path: 'validation',
    canActivate: [OnlyLoggedIn],
    loadChildren: () => import('./+validation/validation.module').then(m => m.ValidationModule),
    data: {preload: true, title: 'Bird Sounds Global'}
  },
  {path: 'results', pathMatch: 'full', loadChildren: () => import('./+results/results.module').then(m => m.ResultsModule), data: {preload: true, title: 'Bird Sounds Global'}},
  {path: 'user', loadChildren: () => import('../../../laji/src/app/+user/user.module').then(m => m.UserModule)}
];

const routesWithLang: Routes = [
  {path: 'en', children: [
      ...routes,
      {path: '**', component: NotFoundComponent}
    ], component: LocaleEnComponent, canActivate: [LocalizeGuard], data: {lang: 'en'}},
  {path: 'sv', children: [
      ...routes,
      {path: '**', component: NotFoundComponent}
    ], component: LocaleSvComponent, canActivate: [LocalizeGuard], data: {lang: 'sv'}},
  {path: '', children: [
      ...routes,
      {path: '**', component: NotFoundComponent}
    ], component: LocaleFiComponent, canActivate: [LocalizeGuard], data: {lang: 'fi'}}
];

const allRoutes: Routes = [
  {path: '', children: routesWithLang, canActivate: [CheckLoginGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(allRoutes, {
    enableTracing: false,
    preloadingStrategy: PreloadSelectedModulesList,
    initialNavigation: 'enabled',
    relativeLinkResolution: 'legacy'
})],
  exports: [RouterModule],
  providers: [PreloadSelectedModulesList]
})
export class KerttuGlobalRoutingModule { }
