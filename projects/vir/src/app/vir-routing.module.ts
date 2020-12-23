import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from '../../../laji/src/app/shared/not-found/not-found.component';
import { LocaleEnComponent } from '../../../laji/src/app/locale/locale-en.component';
import { LocalizeGuard } from '../../../laji/src/app/locale/localize.guard';
import { LocaleSvComponent } from '../../../laji/src/app/locale/locale-sv.component';
import { LocaleFiComponent } from '../../../laji/src/app/locale/locale-fi.component';
import { CheckLoginGuard } from '../../../laji/src/app/shared/guards/check-login.guard';


const routes: Routes = [
  {path: '', pathMatch: 'full', loadChildren: () => import('./+home/home.module').then(m => m.HomeModule), data: {preload: true}},
  {path: 'news', loadChildren: () => import('../../../laji/src/app/+news/news.module').then(m => m.NewsModule), data: {title: 'news.title'}},
//  {path: 'invasive', loadChildren: () => import('./+invasive/invasive.module').then(m => m.InvasiveModule)},
  {path: 'about', loadChildren: () => import('../../../laji/src/app/+information/information.module').then(m => m.InformationModule)},
  {path: 'user', loadChildren: () => import('../../../laji/src/app/+user/user.module').then(m => m.UserModule)},
  {path: 'view', loadChildren: () => import('../../../laji/src/app/+viewer/viewer.module').then(m => m.ViewerModule), data: {title: 'viewer.document'}},
  {path: 'theme', loadChildren: () => import('./+theme/theme.module').then(m => m.ThemeModule)},
  {path: 'usage', loadChildren: () => import('./+usage/usage.module').then(m => m.UsageModule), data: {title: 'navigation.usage'}},
//  {path: 'save-observations', loadChildren: () => import('./+save-observations/save-observations.module').then(m => m.SaveObservationsModule), data: {title: 'navigation.saveVirObservations'}},
  {path: 'monitoring', loadChildren: () => import('./+monitoring/monitoring.module').then(m => m.MonitoringModule), data: {title: 'navigation.monitoring'}},
  {path: 'observation', loadChildren: () => import('../../../laji/src/app/+observation/observation.module').then(m => m.ObservationModule), data: {
    preload: true,
    title: 'navigation.observation'
  }},
  {path: 'taxon', loadChildren: () => import('../../../laji/src/app/+taxonomy/taxonomy.module').then(m => m.TaxonomyModule), data: {
    preload: true,
    title: 'navigation.taxonomy'
  }},
];

const routesWithLang: Routes = [
  {
    path: 'en',
    data: {lang: 'en'},
    children: [...routes, {path: '**', component: NotFoundComponent}],
    component: LocaleEnComponent,
    canActivate: [LocalizeGuard]
  },
  {
    path: 'sv',
    data: {lang: 'sv'},
    children: [...routes, {path: '**', component: NotFoundComponent}],
    component: LocaleSvComponent,
    canActivate: [LocalizeGuard]
  },
  {
    path: '',
    data: {lang: 'fi'},
    children: [...routes, {path: '**', component: NotFoundComponent}],
    component: LocaleFiComponent,
    canActivate: [LocalizeGuard]
  }
];

const allRoutes: Routes = [
  {path: '', children: routesWithLang, canActivate: [CheckLoginGuard]}
];

@NgModule({
  imports: [RouterModule.forRoot(allRoutes, {
    initialNavigation: 'enabled'
  })],
  exports: [RouterModule]
})
export class VirRoutingModule { }
