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
import { TaxonInfoComponent } from './taxon/info-card/taxon-overview/taxon-info/taxon-info.component';
import { LangModule } from '../shared-modules/lang/lang.module';
import { DatatableModule } from '../shared-modules/datatable/datatable.module';
import { BoldSequenceComponent } from './taxon/info-card/taxon-overview/taxon-info/bold-sequence/bold-sequence.component';
import { SpeciesFormComponent } from './species/species-form/species-form.component';
import { SpeciesComponent } from './species/species.component';
import { ButtonsModule, TypeaheadModule } from 'ngx-bootstrap';
import { SearchFiltersModule } from '../shared-modules/search-filters/search-filters.module';
import { JwBootstrapSwitchNg2Module } from 'jw-bootstrap-switch-ng2';
import { TaxonomySearchQuery } from './species/service/taxonomy-search-query';
import { ObservationResultModule } from '../shared-modules/observation-result/observation-result.module';
import { SpeciesBrowseObservationsComponent } from './species/species-browse-observations/species-browse-observations.component';
import { InformalGroupRedirectComponent } from './informal-group-redirect/informal-group-redirect.component';
import { SpeciesImagesComponent } from './species/species-images/species-images.component';
import { TaxonConceptInfoComponent } from './taxon/info-card/taxon-taxonomy/taxon-concept-info/taxon-concept-info.component';
import { YkjModule } from '../shared-modules/ykj/ykj.module';
import { TreeComponent } from './taxon/taxon-tree/tree/tree.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SpeciesListOptionsModalComponent } from './species/species-list-options-modal/species-list-options-modal.component';
import { InfoModule } from '../shared-modules/info/info.module';
import { BoldSynonymComponent } from './taxon/info-card/taxon-overview/taxon-info/bold-synonym/bold-synonym.component';
import { SpeciesCountComponent } from './species/species-count/species-count.component';
import { SpeciesPieComponent } from './taxon/info-card/taxon-overview/species-pie/species-pie.component';
import { NavigationThumbnailModule } from '../shared-modules/navigation-thumbnail/navigation-thumbnail.module';
import { TaxonSelectModule } from '../shared-modules/taxon-select/taxon-select.module';
import { TaxonSynonymsComponent } from './taxon/info-card/taxon-taxonomy/taxon-synonyms/taxon-synonyms.component';
import { TaxonNamesComponent } from './taxon/info-card/taxon-taxonomy/taxon-names/taxon-names.component';
import { BrowseSpeciesComponent } from './browse-species/browse-species.component';
import { InformalGroupSelectComponent } from './browse-species/informal-group-select/informal-group-select.component';
import { InformalListComponent } from './browse-species/informal-group-select/informal-list/informal-list.component';
import {
  InformalListBreadcrumbComponent
} from './browse-species/informal-group-select/informal-list-breadcrumb/informal-list-breadcrumb.component';
import { SelectedParentsComponent } from './species/species-list-options-modal/selected-parents/selected-parents.component';
import { TaxonOverviewComponent } from './taxon/info-card/taxon-overview/taxon-overview.component';
import { TaxonImagesComponent } from './taxon/info-card/taxon-images/taxon-images.component';
import { TaxonBiologyComponent } from './taxon/info-card/taxon-biology/taxon-biology.component';
import { TaxonTaxonomyComponent } from './taxon/info-card/taxon-taxonomy/taxon-taxonomy.component';
import { DownloadModule } from '../shared-modules/download/download.module';
import {
  TaxonDescriptionSourceComponent
} from './taxon/info-card/shared/component/taxon-description-source/taxon-description-source.component';
import { TaxonOccurrenceComponent } from './taxon/info-card/taxon-occurrence/taxon-occurrence.component';
import { TaxonTaxonomyService } from './taxon/service/taxon-taxonomy.service';
import { CheckLangService } from './taxon/service/check-lang.service';
import { GbifMapModule } from '../shared-modules/gbif-map/gbif-map.module';
import { TaxonObservationsComponent } from './taxon/info-card/taxon-observations/taxon-observations.component';
import { InfoCardHeaderComponent } from './taxon/info-card/info-card-header/info-card-header.component';
import { TaxonSpecimensComponent } from './taxon/info-card/taxon-specimens/taxon-specimens.component';
import { TaxonEndangermentComponent } from './taxon/info-card/taxon-endangerment/taxon-endangerment.component';
import { TaxonInvasiveComponent } from './taxon/info-card/taxon-invasive/taxon-invasive.component';
import { DocumentViewerModule } from '../shared-modules/document-viewer/document-viewer.module';
import { IucnCommonModule } from '../shared-modules/iucn/iucn.module';
import { TaxonDescriptionComponent } from './taxon/info-card/shared/component/taxon-description/taxon-description.component';
import { TaxonInfoRowComponent } from './taxon/info-card/shared/component/taxon-info-row/taxon-info-row.component';
import { BiogeographicalProvincesModule } from '../shared-modules/biogeographical-provinces/biogeographical-provinces.module';
import { TaxonOccurrenceMapComponent } from './taxon/info-card/taxon-occurrence/taxon-occurrence-map/taxon-occurrence-map.component';
import { AdministrativeStatusComponent } from './taxon/info-card/shared/component/administrative-status/administrative-status.component';

@NgModule({
  imports: [routing, SharedModule, RouterModule, LangModule, DatatableModule, TypeaheadModule, ButtonsModule,
    SearchFiltersModule, JwBootstrapSwitchNg2Module, ObservationResultModule, YkjModule,
    NgxChartsModule, InfoModule, NavigationThumbnailModule, TaxonSelectModule, DownloadModule, GbifMapModule,
    DocumentViewerModule, IucnCommonModule, BiogeographicalProvincesModule
  ],
  providers: [TaxonomyApi, InformalTaxonGroupApi, TaxonomySearchQuery, TaxonTaxonomyService, CheckLangService],
  declarations: [TaxonomyComponent, TaxonInfoComponent, IUCNComponent,
    TaxonTreeComponent, SpeciesListComponent, TaxonComponent,
    BoldSequenceComponent, SpeciesFormComponent, SpeciesComponent,
    InformalGroupRedirectComponent, SpeciesBrowseObservationsComponent,
    SpeciesImagesComponent, TaxonConceptInfoComponent, TreeComponent,
    SpeciesListOptionsModalComponent, BoldSynonymComponent,
    SpeciesCountComponent, SpeciesPieComponent, InfoCardComponent, TaxonSynonymsComponent,
    TaxonNamesComponent, BrowseSpeciesComponent, InformalGroupSelectComponent, InformalListComponent, InformalListBreadcrumbComponent,
    SelectedParentsComponent,
    TaxonOverviewComponent,
    TaxonImagesComponent,
    TaxonBiologyComponent,
    TaxonTaxonomyComponent,
    TaxonDescriptionSourceComponent,
    TaxonOccurrenceComponent,
    TaxonObservationsComponent,
    InfoCardHeaderComponent,
    TaxonSpecimensComponent,
    TaxonEndangermentComponent,
    TaxonInvasiveComponent,
    TaxonDescriptionComponent,
    TaxonInfoRowComponent,
    TaxonOccurrenceMapComponent,
    AdministrativeStatusComponent
  ],
})
export class TaxonomyModule {
}
