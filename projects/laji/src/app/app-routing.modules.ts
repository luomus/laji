import { Route, RouterModule, Routes } from '@angular/router';
import { ForumComponent } from './forum/forum.component';
import { LocaleEnComponent } from './locale/locale-en.component';
import { LocaleSvComponent } from './locale/locale-sv.component';
import { LocaleFiComponent } from './locale/locale-fi.component';
import { LocalizeGuard } from './locale/localize.guard';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { LocalizeInGuard } from './locale/localize-in.guard';
import { CheckLoginGuard } from './shared/guards/check-login.guard';
import { NgModule } from '@angular/core';
import { QuicklinkStrategy } from 'ngx-quicklink';
import { Global } from '../environments/global';
import { ExternalRedirectComponent } from './shared/external-redirect/external-redirect.component';

const baseRoutes: Routes = [
  {path: '', pathMatch: 'full', loadChildren: () => import('./+home/home.module').then(m => m.HomeModule)},
  {path: 'news', loadChildren: () => import('./+news/news.module').then(m => m.NewsModule), data: {title: 'news.title', preload: false}},
  {path: 'about', loadChildren: () => import('./+information/information.module').then(m => m.InformationModule), data: {preload: false}},
  {path: 'user', loadChildren: () => import('./+user/user.module').then(m => m.UserModule), data: {preload: false}},
  {path: 'view', loadChildren: () => import('./+viewer/viewer.module').then(m => m.ViewerModule), data: {title: 'viewer.document', preload: false}},
  {path: 'vihko', loadChildren: () => import('./+haseka/haseka.module').then(m => m.HasekaModule), data: {title: 'haseka.title', preload: false}},
  {path: 'observation', loadChildren: () => import('./+observation/observation.module').then(m => m.ObservationModule), data: {
    title: 'navigation.observation'
  }},
  {path: 'taxon', loadChildren: () => import('./+taxonomy/taxonomy.module').then(m => m.TaxonomyModule), data: {
    title: 'navigation.taxonomy'
  }},
  {path: 'kartta', loadChildren: () => import('./+map/map.module').then(m => m.MapModule), data: {preload: false, canonical: '/map'}},
  {
    path: 'map', loadChildren: () => import('./+map/map.module').then(m => m.MapModule),
    data: {title: 'navigation.map', displayFeedback: false, preload: false }
  },
  {path: 'error/404', pathMatch: 'full', component: NotFoundComponent},
  {path: 'theme/checklist', component: ExternalRedirectComponent, data: {linkKey: 'infoLinks.checklist'}, pathMatch: 'full'},
  {path: 'theme/ykj', component: ExternalRedirectComponent, data: {linkKey: 'infoLinks.ykj'}, pathMatch: 'full'},
  {path: 'theme/emk', component: ExternalRedirectComponent, data: {linkKey: 'infoLinks.biogeographicalProvinces'}, pathMatch: 'full'},
  {path: 'theme', loadChildren: () => import('./+theme/theme.module').then(m => m.ThemeModule), data: {preload: false}},
  // {path: 'admin', loadChildren: './admin/admin.module#AdminModule'},
  // {path: 'shell', component: ForumComponent},
  {path: 'forum', component: ForumComponent},
  {path: 'ui-components', loadChildren: () => import('./+ui-components/ui-components.module').then(m => m.UiComponentsModule), data: {preload: false}},
  {path: 'trait-db', loadChildren: () => import('./+trait-db/trait-db.module').then(m => m.TraitDbModule)},
  {path: 'save-observations', loadChildren: () => import('./+save-observations/save-observations.module').then(m => m.SaveObservationsModule)},
  {path: 'project', loadChildren: () => import('./+project-form/project-form.module').then(m => m.ProjectFormModule)},
  {path: 'project-edit', loadChildren: () => import('./+project-form-edit/project-form-edit.module').then(m => m.ProjectFormEditModule)},
  {path: 'citation', loadChildren: () => import('./+citable-download/citable-download.module').then(m => m.CitableDownloadModule), data: {preload: false}}
];

const rootRouting = {
  talvilintu: '/project/MHL.3',
  ykj: '/theme/ykj',
  emk: '/theme/emk',
  profile: '/user',
};

Object.keys(Global.oldThemeRouting).forEach(path => {
  rootRouting[<keyof typeof rootRouting>path] = `/project/${Global.oldThemeRouting[<keyof typeof Global.oldThemeRouting>path]}`;
});

const redirectsEn: Routes = [];
const redirectsSv: Routes = [];
const redirectsFi: Routes = [];

redirectsEn.push(...Object.keys(rootRouting).map<Route>(path => ({path, redirectTo: `/en${rootRouting[<keyof typeof rootRouting>path]}`, pathMatch: 'full'})));
redirectsSv.push(...Object.keys(rootRouting).map<Route>(path => ({path, redirectTo: `/sv${rootRouting[<keyof typeof rootRouting>path]}`, pathMatch: 'full'})));
redirectsFi.push(...Object.keys(rootRouting).map<Route>(path => ({path, redirectTo: `${rootRouting[<keyof typeof rootRouting>path]}`, pathMatch: 'full'})));

const routesWithLang: Routes = [
  {path: 'in', children: [
    {path: '**', component: NotFoundComponent}
  ], component: LocaleEnComponent, canActivate: [LocalizeInGuard]},
  {path: 'en', data: {lang: 'en'}, children: [
    ...redirectsEn,
    ...baseRoutes,
    {path: '**', component: NotFoundComponent}
  ], component: LocaleEnComponent, canActivate: [LocalizeGuard]},
  {path: 'sv', data: {lang: 'sv'}, children: [
    ...redirectsFi,
    ...baseRoutes,
    {path: '**', component: NotFoundComponent}
  ], component: LocaleSvComponent, canActivate: [LocalizeGuard]},
  {path: '', data: {lang: 'fi'}, children: [
      ...redirectsFi,
    {path: 'lajiluettelo', redirectTo: '/theme/checklist', pathMatch: 'full'},
    {path: 'artlistan', redirectTo: '/sv/theme/checklist', pathMatch: 'full'},
    {path: 'checklist', redirectTo: '/en/theme/checklist', pathMatch: 'full'},
    {path: 'pinkka', redirectTo: '/theme/pinkka', pathMatch: 'full'},
    {path: 'julkaisut', redirectTo: '/theme/publications', pathMatch: 'full'},
    {path: 'bibliografi', redirectTo: '/sv/theme/publications', pathMatch: 'full'},
    {path: 'publications', redirectTo: '/en/theme/publications', pathMatch: 'full'},
    {path: 'hyonteisopas', redirectTo: '/theme/hyonteisopas', pathMatch: 'full'},
    {path: 'laadunvalvonta', component: ExternalRedirectComponent, data: {linkKey: 'infoLinks.dataQuality'}, pathMatch: 'full'},
    {path: 'sensitiiviset', component: ExternalRedirectComponent, data: {linkKey: 'infoLinks.sensitiveData'}, pathMatch: 'full'},
    {path: 'mobiilivihko',  component: ExternalRedirectComponent, data: {linkKey: 'infoLinks.notebook.mobileNotebook'}, pathMatch: 'full'},
    {path: 'ilmoita', redirectTo: '/save-observations', pathMatch: 'full'},
    {path: 'selaa', redirectTo: '/observation/list', pathMatch: 'full'},
    ...baseRoutes,
    {path: '**', component: NotFoundComponent}
  ], component: LocaleFiComponent, canActivate: [LocalizeGuard]}
];

export const routes: Routes = [
  {path: '', children: routesWithLang, canActivate: [CheckLoginGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false,
    preloadingStrategy: QuicklinkStrategy,
    initialNavigation: 'enabledBlocking'
})],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule { }
