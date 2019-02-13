/* tslint:disable:max-classes-per-file */
import { NgModule } from '@angular/core';
import { PreloadingStrategy, Route, RouterModule, Routes } from '@angular/router';
import { Observable, of as ObservableOf, timer as ObservableTimer } from 'rxjs';
import { LocaleEnComponent } from '../../../../src/app/locale/locale-en.component';
import { LocaleSvComponent } from '../../../../src/app/locale/locale-sv.component';
import { LocaleFiComponent } from '../../../../src/app/locale/locale-fi.component';
import { mergeMap } from 'rxjs/operators';
import { LocalizeGuard } from '../../../../src/app/locale/localize.guard';
import { HomeModule } from './+home/home.module';
import { TaxonomyModule } from './+taxonomy/taxonomy.module';

export class PreloadSelectedModulesList implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    return route.data && route.data.noPreload ? ObservableOf(null) : ObservableTimer(50).pipe(
      mergeMap(() => load())
    );
  }
}

const routes: Routes = [
  {path: '', pathMatch: 'full', loadChildren: () => HomeModule},
  {path: 'about', loadChildren: './+about/about.module#AboutModule'},
  {path: 'publications', loadChildren: './+publications/publications.module#PublicationsModule'},
  {path: 'user', loadChildren: '../../../../src/app/+user/user.module#UserModule', data: {noPreload: true}},
  {path: 'view', loadChildren: '../../../../src/app/+viewer/viewer.module#ViewerModule', data: {title: 'viewer.document'}},
  {path: 'taxon', loadChildren: () => TaxonomyModule, data: {title: 'navigation.taxonomy'}},
  {path: 'error', loadChildren: '../../../../src/app/+error/error.module#ErrorModule', data: {noPreload: true}}
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
