import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routing } from './index';
import { SharedModule } from '../shared/shared.module';
import { TaxonComponent } from './taxon.component';
import { InfoCardComponent } from './info-card/info-card.component';
import { ParentsComponent } from './info-card/parents/parents.component';
import { IUCNComponent } from './iucn/iucn.component';
import { InformalListComponent } from './informal-group-select/informal-list/informal-list.component';
import { InformalListBreadcrumbComponent } from './informal-group-select/informal-list-breadcrumb/informal-list-breadcrumb.component';
import { TaxonTreeComponent } from './taxon-browse/taxon-tree/taxon-tree.component';
import { SpeciesListComponent } from './taxon-browse/species-list/species-list.component';
import { ChildrenListComponent } from './info-card/children-list/children-list.component';
import { TaxonomyApi } from '../shared/api/TaxonomyApi';
import { InformalTaxonGroupApi } from '../shared/api/InformalTaxonGroupApi';
import { TaxonInfoComponent } from './info-card/taxon-info/taxon-info.component';
import { TreeModule } from 'angular-tree-component';
import { LangModule } from '../shared-modules/lang/lang.module';
import { DatatableModule } from '../shared-modules/datatable/datatable.module';
import {BoldSequenceComponent} from './info-card/taxon-info/bold-sequence/bold-sequence.component';
import {HttpClientModule} from '@angular/common/http';
import { SpeciesFormComponent } from './taxon-browse/species-form/species-form.component';
import { TaxonBrowseComponent } from './taxon-browse/taxon-browse.component';
import { TypeaheadModule, ButtonsModule } from 'ngx-bootstrap';
import { SearchFiltersModule } from '../shared-modules/search-filters/search-filters.module';
import { LajiSelectModule } from '../shared-modules/select/select.module';
import { JWBootstrapSwitchModule } from 'jw-bootstrap-switch-ng2';
import { TaxonomySearchQuery } from './taxon-browse/taxonomy-search-query.model';
import { ObservationResultModule } from '../shared-modules/observation-result/observation-result.module';
import { SpeciesDownloadComponent } from './taxon-browse/species-list/species-download/species-download.component';
import { InformalGroupSelectComponent } from './informal-group-select/informal-group-select.component';
import { InformalGroupRedirectComponent } from './informal-group-redirect/informal-group-redirect.component';

@NgModule({
  imports: [routing, SharedModule, RouterModule, TreeModule, LangModule, DatatableModule, HttpClientModule,
    TypeaheadModule, ButtonsModule, SearchFiltersModule, LajiSelectModule, JWBootstrapSwitchModule, ObservationResultModule ],
  providers: [TaxonomyApi, InformalTaxonGroupApi, TaxonomySearchQuery],
  declarations: [TaxonComponent, TaxonInfoComponent, InfoCardComponent, ParentsComponent, IUCNComponent,
    InformalListComponent, InformalListBreadcrumbComponent, TaxonTreeComponent, SpeciesListComponent,
    ChildrenListComponent, BoldSequenceComponent, SpeciesFormComponent, TaxonBrowseComponent, SpeciesDownloadComponent,
    InformalGroupSelectComponent,
    InformalGroupRedirectComponent
  ],
})
export class TaxonomyModule {
}
