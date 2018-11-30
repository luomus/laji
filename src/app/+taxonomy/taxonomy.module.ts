import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routing } from './taxonomy.routes';
import { SharedModule } from '../shared/shared.module';
import { TaxonComponent } from './taxon.component';
import { TaxonomyComponent } from './taxonomy/taxonomy.component';
import { InfoCardComponent } from './taxonomy/info-card/info-card.component';
import { ParentsComponent } from './taxonomy/parents/parents.component';
import { IUCNComponent } from './iucn/iucn.component';
import { InformalListComponent } from './informal-group-select/informal-list/informal-list.component';
import { InformalListBreadcrumbComponent } from './informal-group-select/informal-list-breadcrumb/informal-list-breadcrumb.component';
import { TaxonTreeComponent } from './taxonomy/taxon-tree/taxon-tree.component';
import { SpeciesListComponent } from './taxon-browse/species-list/species-list.component';
import { ChildrenListComponent } from './taxonomy/children-list/children-list.component';
import { TaxonomyApi } from '../shared/api/TaxonomyApi';
import { InformalTaxonGroupApi } from '../shared/api/InformalTaxonGroupApi';
import { TaxonInfoComponent } from './taxonomy/taxon-info/taxon-info.component';
import { LangModule } from '../shared-modules/lang/lang.module';
import { DatatableModule } from '../shared-modules/datatable/datatable.module';
import { BoldSequenceComponent } from './taxonomy/taxon-info/bold-sequence/bold-sequence.component';
import { SpeciesFormComponent } from './taxon-browse/species-form/species-form.component';
import { TaxonBrowseComponent } from './taxon-browse/taxon-browse.component';
import { ButtonsModule, TypeaheadModule } from 'ngx-bootstrap';
import { SearchFiltersModule } from '../shared-modules/search-filters/search-filters.module';
import { JWBootstrapSwitchModule } from 'jw-bootstrap-switch-ng2';
import { TaxonomySearchQuery } from './taxon-browse/service/taxonomy-search-query';
import { ObservationResultModule } from '../shared-modules/observation-result/observation-result.module';
import { SpeciesDownloadComponent } from './taxon-browse/species-download/species-download.component';
import { SpeciesBrowseObservationsComponent } from './taxon-browse/species-browse-observations/species-browse-observations.component';
import { InformalGroupSelectComponent } from './informal-group-select/informal-group-select.component';
import { InformalGroupRedirectComponent } from './informal-group-redirect/informal-group-redirect.component';
import { SpeciesImagesComponent } from './taxon-browse/species-images/species-images.component';
import { TaxonConceptInfoComponent } from './taxonomy/taxon-concept-info/taxon-concept-info.component';
import { ObservationMapModule } from '../shared-modules/observation-map/observation-map.module';
import { TreeTableComponent } from './taxonomy/taxon-tree/tree-table/tree-table.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SpeciesListOptionsModalComponent } from './taxon-browse/species-list-options-modal/species-list-options-modal.component';
import { TaxonomyColumns } from './taxon-browse/service/taxonomy-columns';
import { TaxonExportService } from './taxon-browse/service/taxon-export.service';
import { DatatableUtil } from './taxon-browse/service/datatable-util.service';
import { TaxonSelectComponent } from './taxon-browse/taxon-select/taxon-select.component';
import { ExpandableDatatableComponent } from './taxonomy/taxon-tree/tree-table/expandable-datatable/expandable-datatable.component';
import { InfoModule } from '../shared-modules/info/info.module';
import { BoldSynonymComponent } from './taxonomy/taxon-info/bold-synonym/bold-synonym.component';
import { SpeciesCountComponent } from './taxon-browse/species-count/species-count.component';
import { SpeciesPieComponent } from './taxonomy/species-pie/species-pie.component';

@NgModule({
  imports: [routing, SharedModule, RouterModule, LangModule, DatatableModule, TypeaheadModule, ButtonsModule,
    SearchFiltersModule, JWBootstrapSwitchModule, ObservationResultModule,
    ObservationMapModule, NgxDatatableModule, NgxChartsModule, InfoModule ],
  providers: [TaxonomyApi, InformalTaxonGroupApi, TaxonomySearchQuery, TaxonomyColumns, TaxonExportService, DatatableUtil],
  declarations: [TaxonComponent, TaxonInfoComponent, TaxonomyComponent, ParentsComponent, IUCNComponent,
    InformalListComponent, InformalListBreadcrumbComponent, TaxonTreeComponent, SpeciesListComponent,
    ChildrenListComponent, BoldSequenceComponent, SpeciesFormComponent, TaxonBrowseComponent,
    InformalGroupRedirectComponent, SpeciesDownloadComponent, SpeciesBrowseObservationsComponent,
    InformalGroupSelectComponent, SpeciesImagesComponent, TaxonConceptInfoComponent, TreeTableComponent,
    SpeciesListOptionsModalComponent, TaxonSelectComponent, ExpandableDatatableComponent, BoldSynonymComponent,
    SpeciesCountComponent, SpeciesPieComponent, InfoCardComponent
  ],
})
export class TaxonomyModule {
}
