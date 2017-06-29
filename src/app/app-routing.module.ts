import { NgModule } from '@angular/core';
import { PreloadingStrategy, Route, RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { ViewerComponent } from './+viewer/viewer.component';
import { ForumComponent } from './forum/forum.component';
import { Observable } from 'rxjs/Observable';
import { LocaleEnComponent } from './locale/locale-en.component';
import { LocaleSvComponent } from './locale/locale-sv.component';
import { LocaleFiComponent } from './locale/locale-fi.component';
import { LocalizeRouterService } from './locale/localize-router.service';

const PRELOAD_DELAY = 3000; // ms

export class CustomPreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, fn: () => Observable<boolean>): Observable<boolean> {
    if (route.data && route.data['noPreload']) {
      return Observable.of(false);
    }
    return Observable.of(true).delay(PRELOAD_DELAY).flatMap( (_: boolean) => fn());
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
  {path: 'map', loadChildren: './+map/map.module#MapModule', data: {noPreload: true}},
  {path: 'error', loadChildren: './+error/error.module#ErrorModule', data: {noPreload: true}},
  {path: 'theme', loadChildren: './+theme/theme.module#ThemeModule', data: {noPreload: true}},
  {path: 'nafi', redirectTo: '/theme/nafi', pathMatch: 'full'},
  {path: 'ykj', redirectTo: '/theme/ykj', pathMatch: 'full'},
  {path: 'emk', redirectTo: '/theme/emk', pathMatch: 'full'},
  {path: 'forum', component: ForumComponent, data: {noPreload: true}},
  {path: '**', component: NotFoundComponent, data: {noPreload: true}}
];

const routesWithLang: Routes = [
  {path: 'en', children: LocalizeRouterService.traslateRoutes(routes.slice(0, routes.length), 'en'), component: LocaleEnComponent},
  {path: 'sv', children: LocalizeRouterService.traslateRoutes(routes.slice(0, routes.length), 'sv'), component: LocaleSvComponent},
  {path: '', children: routes, component: LocaleFiComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routesWithLang, {enableTracing: false, preloadingStrategy: CustomPreloadingStrategy})],
  exports: [RouterModule],
  providers: [CustomPreloadingStrategy]
})
export class AppRoutingModule { }
