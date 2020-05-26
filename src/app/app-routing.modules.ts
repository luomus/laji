import { RouterModule, Routes } from '@angular/router';
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
  {path: 'collection', loadChildren: () => import('./+collection/collection.module').then(m => m.CollectionModule), data: {preload: false}},
  {path: 'kartta', loadChildren: () => import('./+map/map.module').then(m => m.MapModule), data: {preload: false}},
  {
    path: 'map', loadChildren: () => import('./+map/map.module').then(m => m.MapModule),
    data: {title: 'navigation.map', displayFeedback: false, preload: false }
  },
  {path: 'error/404', pathMatch: 'full', component: NotFoundComponent},
  {path: 'theme', loadChildren: () => import('./+theme/theme.module').then(m => m.ThemeModule), data: {preload: false}},
  // {path: 'admin', loadChildren: './admin/admin.module#AdminModule'},
  // {path: 'shell', component: ForumComponent},
  {path: 'forum', component: ForumComponent},
  {path: 'ui-components', loadChildren: () => import('./+ui-components/ui-components.module').then(m => m.UiComponentsModule), data: {preload: false}},
  {path: 'save-observations', loadChildren: () => import('./+save-observations/save-observations.module').then(m => m.SaveObservationsModule)}
];

const routesWithLang: Routes = [
  {path: 'in', children: [
    {path: '**', component: NotFoundComponent}
  ], component: LocaleEnComponent, canActivate: [LocalizeInGuard]},
  {path: 'en', data: {lang: 'en'}, children: [
    {path: 'nafi', redirectTo: '/en/theme/nafi/instructions', pathMatch: 'full'},
    {path: 'ykj', redirectTo: '/en/theme/ykj', pathMatch: 'full'},
    {path: 'emk', redirectTo: '/en/theme/emk', pathMatch: 'full'},
    {path: 'linjalaskenta', redirectTo: '/en/theme/linjalaskenta/instructions', pathMatch: 'full'},
    {path: 'talvilintu', redirectTo: '/en/theme/talvilintulaskenta/instructions', pathMatch: 'full'},
    {path: 'sieniatlas', redirectTo: '/en/theme/sieniatlas/instructions', pathMatch: 'full'},
    {path: 'vesilintulaskenta', redirectTo: '/en/theme/vesilintulaskenta/instructions', pathMatch: 'full'},
    {path: 'vieraslajit', redirectTo: '/en/theme/vieraslajit/instructions', pathMatch: 'full'},
    {path: 'kunnat', redirectTo: '/en/theme/kunnat/instructions', pathMatch: 'full'},
    {path: 'lolife', redirectTo: '/en/theme/lolife/about', pathMatch: 'full'},
    {path: 'lepakot', redirectTo: '/en/theme/lepakot/instructions', pathMatch: 'full'},
    {path: 'valio', redirectTo: '/en/theme/valio/instructions', pathMatch: 'full'},
    {path: 'syke-perhoset', redirectTo: '/en/theme/syke-perhoset/instructions', pathMatch: 'full'},
    {path: 'pistelaskenta', redirectTo: '/en/theme/pistelaskenta/instructions', pathMatch: 'full'},
    {path: 'kiiltomadot', redirectTo: '/en/theme/kiiltomadot/instructions', pathMatch: 'full'},
    ...baseRoutes,
    {path: '**', component: NotFoundComponent}
  ], component: LocaleEnComponent, canActivate: [LocalizeGuard]},
  {path: 'sv', data: {lang: 'sv'}, children: [
    {path: 'nafi', redirectTo: '/sv/theme/nafi/instructions', pathMatch: 'full'},
    {path: 'ykj', redirectTo: '/sv/theme/ykj', pathMatch: 'full'},
    {path: 'emk', redirectTo: '/sv/theme/emk', pathMatch: 'full'},
    {path: 'linjalaskenta', redirectTo: '/sv/theme/linjalaskenta/instructions', pathMatch: 'full'},
    {path: 'talvilintu', redirectTo: '/sv/theme/talvilintulaskenta/instructions', pathMatch: 'full'},
    {path: 'sieniatlas', redirectTo: '/sv/theme/sieniatlas/instructions', pathMatch: 'full'},
    {path: 'vesilintulaskenta', redirectTo: '/sv/theme/vesilintulaskenta/instructions', pathMatch: 'full'},
    {path: 'vieraslajit', redirectTo: '/sv/theme/vieraslajit/instructions', pathMatch: 'full'},
    {path: 'kunnat', redirectTo: '/sv/theme/kunnat/instructions', pathMatch: 'full'},
    {path: 'lolife', redirectTo: '/sv/theme/lolife/about', pathMatch: 'full'},
    {path: 'lepakot', redirectTo: '/sv/theme/lepakot/instructions', pathMatch: 'full'},
    {path: 'valio', redirectTo: '/sv/theme/valio/instructions', pathMatch: 'full'},
    {path: 'syke-perhoset', redirectTo: '/sv/theme/syke-perhoset/instructions', pathMatch: 'full'},
    {path: 'pistelaskenta', redirectTo: '/sv/theme/pistelaskenta/instructions', pathMatch: 'full'},
    {path: 'kiiltomadot', redirectTo: '/sv/theme/kiiltomadot/instructions', pathMatch: 'full'},
    ...baseRoutes,
    {path: '**', component: NotFoundComponent}
  ], component: LocaleSvComponent, canActivate: [LocalizeGuard]},
  {path: '', data: {lang: 'fi'}, children: [
    {path: 'nafi', redirectTo: '/theme/nafi/instructions', pathMatch: 'full'},
    {path: 'ykj', redirectTo: '/theme/ykj', pathMatch: 'full'},
    {path: 'emk', redirectTo: '/theme/emk', pathMatch: 'full'},
    {path: 'linjalaskenta', redirectTo: '/theme/linjalaskenta/instructions', pathMatch: 'full'},
    {path: 'talvilintu', redirectTo: '/theme/talvilintulaskenta/instructions', pathMatch: 'full'},
    {path: 'sieniatlas', redirectTo: '/theme/sieniatlas/instructions', pathMatch: 'full'},
    {path: 'vesilintulaskenta', redirectTo: '/theme/vesilintulaskenta/instructions', pathMatch: 'full'},
    {path: 'vieraslajit', redirectTo: '/theme/vieraslajit/instructions', pathMatch: 'full'},
    {path: 'kunnat', redirectTo: '/theme/kunnat/instructions', pathMatch: 'full'},
    {path: 'lolife', redirectTo: '/theme/lolife/about', pathMatch: 'full'},
    {path: 'lepakot', redirectTo: '/theme/lepakot/instructions', pathMatch: 'full'},
    {path: 'valio', redirectTo: '/theme/valio/instructions', pathMatch: 'full'},
    {path: 'syke-perhoset', redirectTo: '/theme/syke-perhoset/instructions', pathMatch: 'full'},
    {path: 'pistelaskenta', redirectTo: '/theme/pistelaskenta/instructions', pathMatch: 'full'},
    {path: 'kiiltomadot', redirectTo: '/theme/kiiltomadot/instructions', pathMatch: 'full'},
    {path: 'lajiluettelo', redirectTo: '/theme/checklist', pathMatch: 'full'},
    {path: 'artlistan', redirectTo: '/sv/theme/checklist', pathMatch: 'full'},
    {path: 'checklist', redirectTo: '/en/theme/checklist', pathMatch: 'full'},
    {path: 'pinkka', redirectTo: '/theme/pinkka', pathMatch: 'full'},
    {path: 'pinkka', redirectTo: '/sv/theme/pinkka', pathMatch: 'full'},
    {path: 'pinkka', redirectTo: '/en/theme/pinkka', pathMatch: 'full'},
    {path: 'hyonteisopas', redirectTo: '/theme/hyonteisopas', pathMatch: 'full'},
    {path: 'hyonteisopas', redirectTo: '/sv/theme/hyonteisopas', pathMatch: 'full'},
    {path: 'hyonteisopas', redirectTo: '/en/theme/hyonteisopas', pathMatch: 'full'},
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
    initialNavigation: 'enabled'
  })],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule { }
