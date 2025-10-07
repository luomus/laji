/* eslint-disable max-classes-per-file */
import { Injectable, NgModule } from '@angular/core';
import { PreloadingStrategy, Route, RouterModule, Routes } from '@angular/router';
import { Observable, of as ObservableOf, timer as ObservableTimer } from 'rxjs';
import { LocaleEnComponent } from '../../../laji/src/app/locale/locale-en.component';
import { catchError, flatMap } from 'rxjs/operators';
import { LocalizeGuard } from '../../../laji/src/app/locale/localize.guard';
import { NotFoundComponent } from '../../../laji/src/app/shared/not-found/not-found.component';
import { CheckLoginGuard } from '../../../laji/src/app/shared/guards/check-login.guard';
import { LocaleEsComponent } from './locale/locale-es.component';
import { LocaleFrComponent } from './locale/locale-fr.component';
import { LocaleZhComponent } from './locale/locale-zh.component';

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
    loadChildren: () => import('./+about/about.module').then(m => m.AboutModule),
    data: {preload: true, title: 'Bird & Bat Sounds Global'}
  },
  {
    path: 'validation',
    loadChildren: () => import('./+validation/validation.module').then(m => m.ValidationModule),
    data: {title: 'Bird & Bat Sounds Global'}
  },
  {
    path: 'identification',
    loadChildren: () => import('./+identification/identification.module').then(m => m.IdentificationModule),
    data: {title: 'Bird & Bat Sounds Global'}
  },
  {
    path: 'bats/identification',
    loadChildren: () => import('./+bat-identification/bat-identification.module').then(m => m.BatIdentificationModule),
    data: {title: 'Bird & Bat Sounds Global'}
  },
  {
    path: 'user',
    loadChildren: () => import('../../../laji/src/app/+user/user.module').then(m => m.UserModule)
  }
];

const routesWithLang: Routes = [
  {path: 'es', data: {lang: 'es'}, children: [
      ...routes,
      {path: '**', component: NotFoundComponent}
    ], component: LocaleEsComponent, canActivate: [LocalizeGuard]},
  {path: 'fr', data: {lang: 'fr'}, children: [
      ...routes,
      {path: '**', component: NotFoundComponent}
    ], component: LocaleFrComponent, canActivate: [LocalizeGuard]},
  {path: '', data: {lang: 'en'}, children: [
      ...routes,
    ], component: LocaleEnComponent, canActivate: [LocalizeGuard]}
];

const allRoutes: Routes = [
  {path: '', children: routesWithLang, canActivate: [CheckLoginGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(allRoutes, {
    enableTracing: false,
    preloadingStrategy: PreloadSelectedModulesList,
    initialNavigation: 'enabledBlocking'
})],
  exports: [RouterModule],
  providers: [PreloadSelectedModulesList]
})
export class AppRoutingModule { }
