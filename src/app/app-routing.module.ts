import { NgModule } from '@angular/core';
import { PreloadingStrategy, Route, RouterModule, Routes } from '@angular/router';
import { ViewerComponent } from './+viewer/viewer.component';
import { ForumComponent } from './forum/forum.component';
import { Observable } from 'rxjs/Observable';
import { LocaleEnComponent } from './locale/locale-en.component';
import { LocaleSvComponent } from './locale/locale-sv.component';
import { LocaleFiComponent } from './locale/locale-fi.component';

export class CustomPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, fn: () => Observable<boolean>): Observable<boolean> {
    if (route.data && route.data['noPreload']) {
      return Observable.of(false);
    }
    return fn();
  }
}

const routes: Routes = [
  {path: '', pathMatch: 'full', loadChildren: './+home/home.module#HomeModule'},
  {path: 'news', loadChildren: './+news/news.module#NewsModule', data: {noPreload: true, title: 'news.title'}},
  {path: 'about', loadChildren: './+information/information.module#InformationModule'},
  {path: 'user', loadChildren: './+user/user.module#UserModule', data: {noPreload: true}},
  {path: 'view', component: ViewerComponent, data: {title: 'viewer.document'} },
  {path: 'invasive', loadChildren: './+invasive/invasive.module#InvasiveModule', data: {noPreload: true}},
  {path: 'vihko', loadChildren: './+haseka/haseka.module#HasekaModule', data: {title: 'haseka.title'}},
  {path: 'observation', loadChildren: './+observation/observation.module#ObservationModule', data: {title: 'navigation.observation'}},
  {path: 'taxon', loadChildren: './+taxonomy/taxonomy.module#TaxonomyModule', data: {title: 'navigation.taxonomy'}},
  {path: 'collection', loadChildren: './+collection/collection.module#CollectionModule', data: {noPreload: true}},
  {path: 'kartta', loadChildren: './+map/map.module#MapModule', data: {noPreload: true}},
  {path: 'map', loadChildren: './+map/map.module#MapModule', data: {title: 'navigation.map', noPreload: true}},
  {path: 'error', loadChildren: './+error/error.module#ErrorModule', data: {noPreload: true}},
  {path: 'theme', loadChildren: './+theme/theme.module#ThemeModule', data: {noPreload: true}},
  {path: 'forum', component: ForumComponent, data: {noPreload: true}}
];

const routesWithLang: Routes = [
  {path: 'en', children: [
    {path: 'nafi', redirectTo: '/en/theme/nafi', pathMatch: 'full'},
    {path: 'ykj', redirectTo: '/en/theme/ykj', pathMatch: 'full'},
    {path: 'emk', redirectTo: '/en/theme/emk', pathMatch: 'full'},
    ...routes,
    {path: '**', redirectTo: '/en/error/404'}
  ], component: LocaleEnComponent},
  {path: 'sv', children: [
    {path: 'nafi', redirectTo: '/sv/theme/nafi', pathMatch: 'full'},
    {path: 'ykj', redirectTo: '/sv/theme/ykj', pathMatch: 'full'},
    {path: 'emk', redirectTo: '/sv/theme/emk', pathMatch: 'full'},
    ...routes,
    {path: '**', redirectTo: '/sv/error/404'}
  ], component: LocaleSvComponent},
  {path: '', children: [
    {path: 'nafi', redirectTo: '/theme/nafi', pathMatch: 'full'},
    {path: 'ykj', redirectTo: '/theme/ykj', pathMatch: 'full'},
    {path: 'emk', redirectTo: '/theme/emk', pathMatch: 'full'},
    ...routes,
    {path: '**', redirectTo: '/error/404'}
  ], component: LocaleFiComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routesWithLang, {enableTracing: false, preloadingStrategy: CustomPreloadingStrategy})],
  exports: [RouterModule],
  providers: [CustomPreloadingStrategy]
})
export class AppRoutingModule { }
