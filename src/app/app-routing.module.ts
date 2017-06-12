import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { ViewerComponent } from './+viewer/viewer.component';
import { ForumComponent } from './forum/forum.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', loadChildren: './+home/home.module#HomeModule'},
  {path: 'news', loadChildren: './+news/news.module#NewsModule'},
  {path: 'about', loadChildren: './+information/information.module#InformationModule'},
  {path: 'user', loadChildren: './+user/user.module#UserModule'},
  {path: 'view', component: ViewerComponent },
  {path: 'invasive', loadChildren: './+invasive/invasive.module#InvasiveModule'},
  {path: 'vihko', loadChildren: './+haseka/haseka.module#HasekaModule'},
  {path: 'observation', loadChildren: './+observation/observation.module#ObservationModule'},
  {path: 'taxon', loadChildren: './+taxonomy/taxonomy.module#TaxonomyModule'},
  {path: 'collection', loadChildren: './+collection/collection.module#CollectionModule'},
  {path: 'kartta', loadChildren: './+map/map.module#MapModule'},
  {path: 'map', loadChildren: './+map/map.module#MapModule'},
  {path: 'error', loadChildren: './+error/error.module#ErrorModule'},
  {path: 'theme', loadChildren: './+theme/theme.module#ThemeModule'},
  {path: 'nafi', redirectTo: '/theme/nafi', pathMatch: 'full'},
  {path: 'forum', component: ForumComponent },
  {path: '**', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
