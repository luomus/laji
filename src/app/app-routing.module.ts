/* tslint:disable:max-classes-per-file */
import { NgModule } from '@angular/core';
import { PreloadingStrategy, Route, RouterModule, Routes } from '@angular/router';
import { ForumComponent } from './forum/forum.component';
import { Observable, of as ObservableOf, timer as ObservableTimer } from 'rxjs';
import { LocaleEnComponent } from './locale/locale-en.component';
import { LocaleSvComponent } from './locale/locale-sv.component';
import { LocaleFiComponent } from './locale/locale-fi.component';
import { mergeMap } from 'rxjs/operators';
import { LocalizeGuard } from './locale/localize.guard';

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
  {path: 'view', loadChildren: './+viewer/viewer.module#ViewerModule', data: {title: 'viewer.document'}},
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
  {path: 'en', data: {lang: 'en'}, children: [
    {path: 'nafi', redirectTo: '/en/theme/nafi/instructions', pathMatch: 'full'},
    {path: 'ykj', redirectTo: '/en/theme/ykj', pathMatch: 'full'},
    {path: 'emk', redirectTo: '/en/theme/emk', pathMatch: 'full'},
    {path: 'linjalaskenta', redirectTo: '/en/theme/linjalaskenta/instructions', pathMatch: 'full'},
    {path: 'talvilintu', redirectTo: '/en/theme/talvilintulaskenta/instructions', pathMatch: 'full'},
    {path: 'vieraslajit', redirectTo: '/en/theme/vieraslajit/instructions', pathMatch: 'full'},
    {path: 'kunnat', redirectTo: '/en/theme/kunnat/instructions', pathMatch: 'full'},
    {path: 'lolife', redirectTo: '/en/theme/lolife/instructions', pathMatch: 'full'},
    ...routes,
    {path: '**', redirectTo: '/en/error/404'}
  ], component: LocaleEnComponent, canActivate: [LocalizeGuard]},
  {path: 'sv', data: {lang: 'sv'}, children: [
    {path: 'nafi', redirectTo: '/sv/theme/nafi/instructions', pathMatch: 'full'},
    {path: 'ykj', redirectTo: '/sv/theme/ykj', pathMatch: 'full'},
    {path: 'emk', redirectTo: '/sv/theme/emk', pathMatch: 'full'},
    {path: 'linjalaskenta', redirectTo: '/sv/theme/linjalaskenta/instructions', pathMatch: 'full'},
    {path: 'talvilintu', redirectTo: '/sv/theme/talvilintulaskenta/instructions', pathMatch: 'full'},
    {path: 'vieraslajit', redirectTo: '/sv/theme/vieraslajit/instructions', pathMatch: 'full'},
    {path: 'kunnat', redirectTo: '/sv/theme/kunnat/instructions', pathMatch: 'full'},
    {path: 'lolife', redirectTo: '/sv/theme/lolife/instructions', pathMatch: 'full'},
    ...routes,
    {path: '**', redirectTo: '/sv/error/404'}
  ], component: LocaleSvComponent, canActivate: [LocalizeGuard]},
  {path: '', data: {lang: 'fi'}, children: [
    {path: 'nafi', redirectTo: '/theme/nafi/instructions', pathMatch: 'full'},
    {path: 'ykj', redirectTo: '/theme/ykj', pathMatch: 'full'},
    {path: 'emk', redirectTo: '/theme/emk', pathMatch: 'full'},
    {path: 'linjalaskenta', redirectTo: '/theme/linjalaskenta/instructions', pathMatch: 'full'},
    {path: 'talvilintu', redirectTo: '/theme/talvilintulaskenta/instructions', pathMatch: 'full'},
    {path: 'vieraslajit', redirectTo: '/theme/vieraslajit/instructions', pathMatch: 'full'},
    {path: 'kunnat', redirectTo: '/theme/kunnat/instructions', pathMatch: 'full'},
    {path: 'lolife', redirectTo: '/theme/lolife/instructions', pathMatch: 'full'},
    {path: 'lajiluettelo', redirectTo: '/theme/checklist', pathMatch: 'full'},
    {path: 'artlistan', redirectTo: '/sv/theme/checklist', pathMatch: 'full'},
    {path: 'checklist', redirectTo: '/en/theme/checklist', pathMatch: 'full'},
    ...routes,
    {path: '**', redirectTo: '/error/404'}
  ], component: LocaleFiComponent, canActivate: [LocalizeGuard]}
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
