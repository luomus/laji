import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routing } from './index';
import { SharedModule } from '../shared/shared.module';
import { TaxonComponent } from './taxon.component';
import { InfoCardComponent } from './info-card/info-card.component';
import { ParentsComponent } from './info-card/parents/parents.component';
import { IUCNComponent } from './iucn/iucn.component';
import { InformalListComponent } from './informal-list/informal-list.component';
import { InformalListBreadcrumbComponent } from './informal-list-breadcrumb/informal-list-breadcrumb.component';
import { TreeOfLifeComponent } from './tree-of-life/tree-of-life.component';
import { TaxonTreeComponent } from './taxon-tree/taxon-tree.component';
import { SpeciesListComponent } from './species-list/species-list.component';
import { ImageGalleryComponent } from '../shared/image-gallery/image-gallery.component';
import { ChildrenListComponent } from './info-card/children-list/children-list.component';
import { TaxonomyApi } from '../shared/api/TaxonomyApi';
import { InformalTaxonGroupApi } from '../shared/api/InformalTaxonGroupApi';
import { TaxonInfoComponent } from './info-card/taxon/taxon-info.component';
import { TreeModule } from 'angular2-tree-component';

@NgModule({
  imports: [routing, SharedModule, RouterModule, TreeModule],
  providers: [TaxonomyApi, InformalTaxonGroupApi],
  declarations: [TaxonComponent, TaxonInfoComponent, InfoCardComponent, ParentsComponent, IUCNComponent,
    InformalListComponent, InformalListBreadcrumbComponent, TreeOfLifeComponent, TaxonTreeComponent, SpeciesListComponent,
    ImageGalleryComponent, ChildrenListComponent
  ],
})
export class TaxonomyModule {
}
