import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from '../../../laji/src/app/shared/not-found/not-found.component';
import { LocaleEnComponent } from '../../../laji/src/app/locale/locale-en.component';
import { LocalizeGuard } from '../../../laji/src/app/locale/localize.guard';
import { LocaleSvComponent } from '../../../laji/src/app/locale/locale-sv.component';
import { LocaleFiComponent } from '../../../laji/src/app/locale/locale-fi.component';


const routes: Routes = [
  {path: '', pathMatch: 'full', loadChildren: () => import('./+home/home.module').then(m => m.HomeModule)},
  {path: 'species', loadChildren: () => import('./+species/species.module').then(m => m.SpeciesModule)}
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
  {path: '', children: routesWithLang}
];

@NgModule({
  imports: [RouterModule.forRoot(allRoutes, {
    initialNavigation: 'enabledBlocking',
    relativeLinkResolution: 'legacy'
})],
  exports: [RouterModule]
})
export class BaRoutingModule { }
