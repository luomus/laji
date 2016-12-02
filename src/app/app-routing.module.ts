import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './shared/not-found/not-found.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', loadChildren: './+home/home.module#HomeModule'},
  {path: 'news', loadChildren: './+news/news.module#NewsModule'},
  {path: 'information', loadChildren: './+information/information.module#InformationModule'},
  {path: 'user', loadChildren: './+user/user.module#UserModule'},
  {path: 'vihko', loadChildren: './+haseka/haseka.module#HasekaModule'},
  {path: 'observation', loadChildren: './+observation/observation.module#ObservationModule'},
  {path: 'taxon', loadChildren: './+taxonomy/taxonomy.module#TaxonomyModule'},
  {path: 'collection', loadChildren: './+collection/collection.module#CollectionModule'},
  {path: 'error', loadChildren: './+error/error.module#ErrorModule'},
  {path: '**', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
