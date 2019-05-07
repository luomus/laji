/* tslint:disable:max-classes-per-file */
import { NgModule } from '@angular/core';
import { PreloadingStrategy, Route, RouterModule, Routes } from '@angular/router';
import { Observable, of as ObservableOf, timer as ObservableTimer } from 'rxjs';
import { LocaleEnComponent } from '../../../../src/app/locale/locale-en.component';
import { LocaleSvComponent } from '../../../../src/app/locale/locale-sv.component';
import { LocaleFiComponent } from '../../../../src/app/locale/locale-fi.component';
import { catchError, flatMap } from 'rxjs/operators';
import { LocalizeGuard } from '../../../../src/app/locale/localize.guard';

export class PreloadSelectedModulesList implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    const loadRoute = () => ObservableTimer(50).pipe(flatMap(() => load()), catchError(() => ObservableOf(null)));

    return route.data && route.data.preload ? loadRoute() : ObservableOf(null);
  }
}

const routes: Routes = [
  {path: '', pathMatch: 'full', loadChildren: './+home/iucn-home.module#IucnHomeModule', data: {preload: true}},
  {path: 'about', loadChildren: './+about/about.module#AboutModule', data: {title: 'iucn.about.title'}},
  {path: 'publications', loadChildren: './+publications/publications.module#PublicationsModule', data: {title: 'iucn.publications.title'}},
  {path: 'user', loadChildren: '../../../../src/app/+user/user.module#UserModule'},
  {path: 'view', loadChildren: '../../../../src/app/+viewer/viewer.module#ViewerModule', data: {title: 'viewer.document'}},
  {path: 'results', loadChildren: './+taxonomy/iucn-taxonomy.module#IucnTaxonomyModule', data: {preload: true}},
  {path: 'error', loadChildren: '../../../../src/app/+error/error.module#ErrorModule'}
];

const routesWithLang: Routes = [
  {path: 'en', children: [
      ...routes,
      {path: '**', redirectTo: '/en/error/404'}
    ], component: LocaleEnComponent, canActivate: [LocalizeGuard], data: {lang: 'en'}},
  {path: 'sv', children: [
      ...routes,
      {path: '**', redirectTo: '/sv/error/404'}
    ], component: LocaleSvComponent, canActivate: [LocalizeGuard], data: {lang: 'sv'}},
  {path: '', children: [
      ...routes,
      {path: '**', redirectTo: '/error/404'}
    ], component: LocaleFiComponent, canActivate: [LocalizeGuard], data: {lang: 'fi'}}
];

@NgModule({
  imports: [RouterModule.forRoot(routesWithLang, {
    enableTracing: false,
    preloadingStrategy: PreloadSelectedModulesList,
    initialNavigation: 'enabled'
  })],
  exports: [RouterModule],
  providers: [PreloadSelectedModulesList]
})
export class IucnRoutingModule { }
