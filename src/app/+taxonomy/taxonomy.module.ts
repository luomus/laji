import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routing } from './taxonomy.routes';
import { SharedModule } from '../shared/shared.module';
import { TaxonomyComponent } from './taxonomy.component';
import { TaxonComponent } from './taxon/taxon.component';
import { InfoCardComponent } from './taxon/info-card/info-card.component';
import { IUCNComponent } from './iucn/iucn.component';
import { TaxonTreeComponent } from './taxon/taxon-tree/taxon-tree.component';
import { SpeciesListComponent } from './species/species-list/species-list.component';
import { TaxonomyApi } from '../shared/api/TaxonomyApi';
import { InformalTaxonGroupApi } from '../shared/api/InformalTaxonGroupApi';
import { TaxonInfoComponent } from './taxon/info-card/taxon-info/taxon-info.component';
import { LangModule } from '../shared-modules/lang/lang.module';
import { DatatableModule } from '../shared-modules/datatable/datatable.module';
import { BoldSequenceComponent } from './taxon/info-card/taxon-info/bold-sequence/bold-sequence.component';
import { SpeciesFormComponent } from './species/species-form/species-form.component';
import { SpeciesComponent } from './species/species.component';
import { ButtonsModule, TypeaheadModule } from 'ngx-bootstrap';
import { SearchFiltersModule } from '../shared-modules/search-filters/search-filters.module';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';
import { TaxonomySearchQuery } from './species/service/taxonomy-search-query';
import { ObservationResultModule } from '../shared-modules/observation-result/observation-result.module';
import { SpeciesDownloadComponent } from './species/species-download/species-download.component';
import { SpeciesBrowseObservationsComponent } from './species/species-browse-observations/species-browse-observations.component';
import { InformalGroupRedirectComponent } from './informal-group-redirect/informal-group-redirect.component';
import { SpeciesImagesComponent } from './species/species-images/species-images.component';
import { TaxonConceptInfoComponent } from './taxon/info-card/taxon-concept-info/taxon-concept-info.component';
import { ObservationMapModule } from '../shared-modules/observation-map/observation-map.module';
import { TreeComponent } from './taxon/taxon-tree/tree/tree.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SpeciesListOptionsModalComponent } from './species/species-list-options-modal/species-list-options-modal.component';
import { TaxonomyColumns } from './species/service/taxonomy-columns';
import { TaxonExportService } from './species/service/taxon-export.service';
import { DatatableUtil } from './species/service/datatable-util.service';
import { InfoModule } from '../shared-modules/info/info.module';
import { BoldSynonymComponent } from './taxon/info-card/taxon-info/bold-synonym/bold-synonym.component';
import { SpeciesCountComponent } from './species/species-count/species-count.component';
import { SpeciesPieComponent } from './taxon/info-card/species-pie/species-pie.component';
import { NavigationThumbnailModule } from '../shared-modules/navigation-thumbnail/navigation-thumbnail.module';
import { TaxonSelectModule } from '../shared-modules/taxon-select/taxon-select.module';
import { TaxonDescriptionsComponent } from './taxon/info-card/taxon-descriptions/taxon-descriptions.component';
import { TaxonSynonymsComponent } from './taxon/info-card/taxon-synonyms/taxon-synonyms.component';
import { TaxonNamesComponent } from './taxon/info-card/taxon-names/taxon-names.component';
import { BrowseSpeciesComponent } from './browse-species/browse-species.component';
import { InformalGroupSelectComponent } from './browse-species/informal-group-select/informal-group-select.component';
import { InformalListComponent } from './browse-species/informal-group-select/informal-list/informal-list.component';
import {
  InformalListBreadcrumbComponent
} from './browse-species/informal-group-select/informal-list-breadcrumb/informal-list-breadcrumb.component';

@NgModule({
  imports: [routing, SharedModule, RouterModule, LangModule, DatatableModule, TypeaheadModule, ButtonsModule,
    SearchFiltersModule, JwBootstrapSwitchNg2Module, ObservationResultModule, ObservationMapModule, NgxDatatableModule,
    NgxChartsModule, InfoModule, NavigationThumbnailModule, TaxonSelectModule ],
  providers: [TaxonomyApi, InformalTaxonGroupApi, TaxonomySearchQuery, TaxonomyColumns, TaxonExportService, DatatableUtil],
  declarations: [TaxonomyComponent, TaxonInfoComponent, IUCNComponent,
    TaxonTreeComponent, SpeciesListComponent, TaxonComponent,
    BoldSequenceComponent, SpeciesFormComponent, SpeciesComponent,
    InformalGroupRedirectComponent, SpeciesDownloadComponent, SpeciesBrowseObservationsComponent,
    SpeciesImagesComponent, TaxonConceptInfoComponent, TreeComponent,
    SpeciesListOptionsModalComponent, BoldSynonymComponent,
    SpeciesCountComponent, SpeciesPieComponent, InfoCardComponent, TaxonDescriptionsComponent, TaxonSynonymsComponent,
    TaxonNamesComponent, BrowseSpeciesComponent, InformalGroupSelectComponent, InformalListComponent, InformalListBreadcrumbComponent
  ],
})
export class TaxonomyModule {
}
