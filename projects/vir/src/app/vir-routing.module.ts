import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from '../../../../src/app/shared/not-found/not-found.component';
import { LocaleEnComponent } from '../../../../src/app/locale/locale-en.component';
import { LocalizeGuard } from '../../../../src/app/locale/localize.guard';
import { LocaleSvComponent } from '../../../../src/app/locale/locale-sv.component';
import { LocaleFiComponent } from '../../../../src/app/locale/locale-fi.component';
import { CheckLoginGuard } from '../../../../src/app/shared/guards/check-login.guard';


const routes: Routes = [
  {path: '', pathMatch: 'full', loadChildren: () => import('../../../../src/app/+home/home.module').then(m => m.HomeModule), data: {preload: true}},
  {path: 'news', loadChildren: () => import('../../../../src/app/+news/news.module').then(m => m.NewsModule), data: {title: 'news.title'}},
//  {path: 'invasive', loadChildren: () => import('./+invasive/invasive.module').then(m => m.InvasiveModule)},
  {path: 'about', loadChildren: () => import('../../../../src/app/+information/information.module').then(m => m.InformationModule)},
  {path: 'user', loadChildren: () => import('../../../../src/app/+user/user.module').then(m => m.UserModule)},
  {path: 'view', loadChildren: () => import('../../../../src/app/+viewer/viewer.module').then(m => m.ViewerModule), data: {title: 'viewer.document'}},
  {path: 'usage', loadChildren: () => import('./+usage/usage.module').then(m => m.UsageModule), data: {title: 'navigation.usage'}},
  {path: 'save-observations', loadChildren: () => import('./+save-observations/save-observations.module').then(m => m.SaveObservationsModule), data: {title: 'navigation.saveVirObservations'}},
  {path: 'observation', loadChildren: () => import('../../../../src/app/+observation/observation.module').then(m => m.ObservationModule), data: {
    preload: true,
    title: 'navigation.observation'
  }},
  {path: 'taxon', loadChildren: () => import('../../../../src/app/+taxonomy/taxonomy.module').then(m => m.TaxonomyModule), data: {
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
  imports: [RouterModule.forRoot(allRoutes)],
  exports: [RouterModule]
})
export class VirRoutingModule { }
