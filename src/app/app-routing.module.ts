import { NgModule } from '@angular/core';
import { PreloadingStrategy, Route, RouterModule, Routes } from '@angular/router';
import { ViewerComponent } from './+viewer/viewer.component';
import { ViewerPrintComponent } from './+viewer/viewer-print/viewer-print.component';
import { ForumComponent } from './forum/forum.component';
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
  {path: '', pathMatch: 'full', loadChildren: './+home/home.module#HomeModule'},
  {path: 'news', loadChildren: './+news/news.module#NewsModule', data: {noPreload: true, title: 'news.title'}},
  {path: 'about', loadChildren: './+information/information.module#InformationModule'},
  {path: 'user', loadChildren: './+user/user.module#UserModule', data: {noPreload: true}},
  {path: 'view', pathMatch: 'full', component: ViewerComponent, data: {title: 'viewer.document'} },
  {path: 'view/print', pathMatch: 'full', component: ViewerPrintComponent, data: {title: 'viewer.document'} },
  {path: 'invasive', loadChildren: './+invasive/invasive.module#InvasiveModule', data: {noPreload: true}},
  {path: 'vihko', loadChildren: './+haseka/haseka.module#HasekaModule', data: {title: 'haseka.title'}},
  {path: 'observation', loadChildren: './+observation/observation.module#ObservationModule', data: {title: 'navigation.observation'}},
  {path: 'taxon', loadChildren: './+taxonomy/taxonomy.module#TaxonomyModule', data: {title: 'navigation.taxonomy'}},
  {path: 'collection', loadChildren: './+collection/collection.module#CollectionModule', data: {noPreload: true}},
  {path: 'kartta', loadChildren: './+map/map.module#MapModule', data: {noPreload: true}},
  {path: 'map', loadChildren: './+map/map.module#MapModule', data: {title: 'navigation.map', noPreload: true}},
  {path: 'error', loadChildren: './+error/error.module#ErrorModule', data: {noPreload: true}},
  {path: 'theme', loadChildren: './+theme/theme.module#ThemeModule', data: {noPreload: true}},
  // {path: 'admin', loadChildren: './admin/admin.module#AdminModule', data: {noPreload: true}},
  // {path: 'shell', component: ForumComponent, data: {noPreload: true}},
  {path: 'forum', component: ForumComponent, data: {noPreload: true}}
];

const routesWithLang: Routes = [
  {path: 'en', children: [
    {path: 'nafi', redirectTo: '/en/theme/nafi', pathMatch: 'full'},
    {path: 'ykj', redirectTo: '/en/theme/ykj', pathMatch: 'full'},
    {path: 'emk', redirectTo: '/en/theme/emk', pathMatch: 'full'},
    {path: 'linjalaskenta', redirectTo: '/en/theme/linjalaskenta', pathMatch: 'full'},
    {path: 'talvilintu', redirectTo: '/en/theme/talvilintulaskenta', pathMatch: 'full'},
    ...routes,
    {path: '**', redirectTo: '/en/error/404'}
  ], component: LocaleEnComponent},
  {path: 'sv', children: [
    {path: 'nafi', redirectTo: '/sv/theme/nafi', pathMatch: 'full'},
    {path: 'ykj', redirectTo: '/sv/theme/ykj', pathMatch: 'full'},
    {path: 'emk', redirectTo: '/sv/theme/emk', pathMatch: 'full'},
    {path: 'linjalaskenta', redirectTo: '/sv/theme/linjalaskenta', pathMatch: 'full'},
    {path: 'talvilintu', redirectTo: '/sv/theme/talvilintulaskenta', pathMatch: 'full'},
    ...routes,
    {path: '**', redirectTo: '/sv/error/404'}
  ], component: LocaleSvComponent},
  {path: '', children: [
    {path: 'nafi', redirectTo: '/theme/nafi', pathMatch: 'full'},
    {path: 'ykj', redirectTo: '/theme/ykj', pathMatch: 'full'},
    {path: 'emk', redirectTo: '/theme/emk', pathMatch: 'full'},
    {path: 'linjalaskenta', redirectTo: '/theme/linjalaskenta', pathMatch: 'full'},
    {path: 'talvilintu', redirectTo: '/theme/talvilintulaskenta', pathMatch: 'full'},
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
export class AppRoutingModule { }
