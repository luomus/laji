import { NgModule } from '@angular/core';
import { PreloadingStrategy, Route, RouterModule, Routes } from '@angular/router';
import { Observable, of as ObservableOf, timer as ObservableTimer } from 'rxjs';
import { LocaleEnComponent } from './locale/locale-en.component';
import { LocaleSvComponent } from './locale/locale-sv.component';
import { LocaleFiComponent } from './locale/locale-fi.component';
import { mergeMap } from 'rxjs/operators';

export class PreloadSelectedModulesList implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    return route.data && route.data.noPreload ? ObservableOf(null) : ObservableTimer(50).pipe(
      mergeMap(() => load())
    );
  }
}

const routes: Routes = [
  {path: '', pathMatch: 'full', loadChildren: './iucn/+home/home.module#HomeModule'},
  {path: 'news', loadChildren: './+news/news.module#NewsModule', data: {noPreload: true, title: 'news.title'}},
  {path: 'about', loadChildren: './+information/information.module#InformationModule'},
  {path: 'publications', loadChildren: './iucn/+publications/publications.module#PublicationsModule'},
  {path: 'user', loadChildren: './+user/user.module#UserModule', data: {noPreload: true}},
  {path: 'view', loadChildren: './+viewer/viewer.module#ViewerModule', data: {title: 'viewer.document'}},
  {path: 'observation', loadChildren: './+observation/observation.module#ObservationModule', data: {title: 'navigation.observation'}},
  {path: 'taxon', loadChildren: './+taxonomy/taxonomy.module#TaxonomyModule', data: {title: 'navigation.taxonomy'}},
  {path: 'error', loadChildren: './+error/error.module#ErrorModule', data: {noPreload: true}}
];

const routesWithLang: Routes = [
  {path: 'en', children: [
    ...routes,
    {path: '**', redirectTo: '/en/error/404'}
  ], component: LocaleEnComponent},
  {path: 'sv', children: [
    ...routes,
    {path: '**', redirectTo: '/sv/error/404'}
  ], component: LocaleSvComponent},
  {path: '', children: [
    ...routes,
    {path: '**', redirectTo: '/error/404'}
  ], component: LocaleFiComponent}
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
