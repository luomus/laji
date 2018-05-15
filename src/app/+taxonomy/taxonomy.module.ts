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
import { TaxonTreeComponent } from './taxon-tree/taxon-tree.component';
import { SpeciesListComponent } from './species-list/species-list.component';
import { ChildrenListComponent } from './info-card/children-list/children-list.component';
import { TaxonomyApi } from '../shared/api/TaxonomyApi';
import { InformalTaxonGroupApi } from '../shared/api/InformalTaxonGroupApi';
import { TaxonInfoComponent } from './info-card/taxon-info/taxon-info.component';
import { TreeModule } from 'angular-tree-component';
import { LangModule } from '../shared-modules/lang/lang.module';
import { DatatableModule } from '../shared-modules/datatable/datatable.module';
import {BoldSequenceComponent} from './info-card/taxon-info/bold-sequence/bold-sequence.component';
import {HttpClientModule} from '@angular/common/http';
import { SpeciesFormComponent } from './species-form/species-form.component';
import { InformalComponent } from './informal/informal.component';
import { TypeaheadModule, ButtonsModule } from 'ngx-bootstrap';
import { SearchFiltersModule } from '../shared-modules/search-filters/search-filters.module';
import { LajiSelectModule } from '../shared-modules/select/select.module';
import { JWBootstrapSwitchModule } from 'jw-bootstrap-switch-ng2';
import { TaxonomySearchQuery } from './taxonomy-search-query.model';
import { ObservationResultModule } from '../shared-modules/observation-result/observation-result.module';
import { SpeciesDownloadComponent } from './species-download/species-download.component';

@NgModule({
  imports: [routing, SharedModule, RouterModule, TreeModule, LangModule, DatatableModule, HttpClientModule,
    TypeaheadModule, ButtonsModule, SearchFiltersModule, LajiSelectModule, JWBootstrapSwitchModule, ObservationResultModule ],
  providers: [TaxonomyApi, InformalTaxonGroupApi, TaxonomySearchQuery],
  declarations: [TaxonComponent, TaxonInfoComponent, InfoCardComponent, ParentsComponent, IUCNComponent,
    InformalListComponent, InformalListBreadcrumbComponent, TaxonTreeComponent, SpeciesListComponent,
    ChildrenListComponent, BoldSequenceComponent, SpeciesFormComponent, InformalComponent, SpeciesDownloadComponent
  ],
})
export class TaxonomyModule {
}
