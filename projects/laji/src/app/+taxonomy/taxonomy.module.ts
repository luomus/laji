/* eslint-disable max-len */
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
import { SpeciesFormComponent } from './species/species-form/species-form.component';
import { SpeciesComponent } from './species/species.component';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
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
import { SpeciesListOptionsModalComponent } from './species/species-list-options-modal/species-list-options-modal.component';
import { InfoModule } from '../shared-modules/info/info.module';
import { SpeciesCountComponent } from './species/species-count/species-count.component';
import { SpeciesPieComponent } from './taxon/info-card/taxon-overview/species-pie/species-pie.component';
import { NavigationThumbnailModule } from '../shared-modules/navigation-thumbnail/navigation-thumbnail.module';
import { TaxonSelectModule } from '../shared-modules/taxon-select/taxon-select.module';
import { TaxonSynonymsComponent } from './taxon/info-card/taxon-taxonomy/taxon-synonyms/taxon-synonyms.component';
import { TaxonNamesComponent } from './taxon/info-card/taxon-taxonomy/taxon-names/taxon-names.component';
import { BrowseSpeciesComponent } from './browse-species/browse-species.component';
import { InformalGroupSelectComponent } from './browse-species/informal-group-select/informal-group-select.component';
import { InformalListComponent } from './browse-species/informal-group-select/informal-list/informal-list.component';
import { InformalListBreadcrumbComponent } from './browse-species/informal-group-select/informal-list-breadcrumb/informal-list-breadcrumb.component';
import { SelectedParentsComponent } from './species/species-list-options-modal/selected-parents/selected-parents.component';
import { TaxonOverviewComponent } from './taxon/info-card/taxon-overview/taxon-overview.component';
import { TaxonImagesComponent } from './taxon/info-card/taxon-images/taxon-images.component';
import { TaxonBiologyComponent } from './taxon/info-card/taxon-biology/taxon-biology.component';
import { TaxonTaxonomyComponent } from './taxon/info-card/taxon-taxonomy/taxon-taxonomy.component';
import { DownloadModalModule } from '../shared-modules/download-modal/download-modal.module';
import { TaxonDescriptionSourceComponent } from './taxon/info-card/shared/component/taxon-description-source/taxon-description-source.component';
import { TaxonOccurrenceComponent } from './taxon/info-card/taxon-occurrence/taxon-occurrence.component';
import { TaxonTaxonomyService } from './taxon/service/taxon-taxonomy.service';
import { TaxonAutocompleteService } from '../shared/service/taxon-autocomplete.service';
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
import { LajiUiModule } from '../../../../laji-ui/src/public-api';
import { LicenseModule } from '../shared-modules/license/license.module';
import { TableColumnService } from '../shared-modules/datatable/service/table-column.service';
import { ObservationTableColumnService } from '../shared-modules/datatable/service/observation-table-column.service';
import { TaxonYlestaFieldsComponent } from './taxon/info-card/shared/component/taxon-ylesta-fields/taxon-ylesta-fields.component';
import { TechnicalNewsModule } from '../shared-modules/technical-news/technical-news.module';
import { InfoPageModule } from '../shared-modules/info-page/info-page.module';
import { ChartModule } from '../shared-modules/chart/chart.module';
import { TaxonIdentificationComponent } from './taxon/info-card/taxon-identification/taxon-identification.component';
import {SelectModule} from '../shared-modules/select/select.module';
import { IdentificationListComponent } from './taxon/info-card/taxon-identification/identification-list/identification-list.component';
import { LabelPipe } from '../shared/pipe/label.pipe';
import { TaxonIdentificationFacade } from './taxon/info-card/taxon-identification/taxon-identification.facade';
import { TaxonBoldComponent } from './taxon/info-card/shared/component/taxon-bold/taxon-bold.component';
/* eslint-enable max-len */

@NgModule({
  imports: [routing, SharedModule, RouterModule, LangModule, DatatableModule, TypeaheadModule,
    SearchFiltersModule, JwBootstrapSwitchNg2Module, ObservationResultModule, YkjModule,
    InfoModule, NavigationThumbnailModule, TaxonSelectModule, DownloadModalModule, GbifMapModule,
    DocumentViewerModule, IucnCommonModule, BiogeographicalProvincesModule, LajiUiModule, LicenseModule, TechnicalNewsModule,
    ChartModule, TechnicalNewsModule, InfoPageModule, SelectModule
  ],
  providers: [
    TaxonomyApi,
    InformalTaxonGroupApi,
    TaxonomySearchQuery,
    TaxonTaxonomyService,
    CheckLangService,
    {provide: TableColumnService, useClass: ObservationTableColumnService},
    TaxonAutocompleteService,
    LabelPipe,
    TaxonIdentificationFacade
  ],
  declarations: [TaxonomyComponent, TaxonInfoComponent, IUCNComponent,
    TaxonTreeComponent, SpeciesListComponent, TaxonComponent,
    SpeciesFormComponent, SpeciesComponent,
    InformalGroupRedirectComponent, SpeciesBrowseObservationsComponent,
    SpeciesImagesComponent, TaxonConceptInfoComponent, TreeComponent,
    SpeciesListOptionsModalComponent, SpeciesCountComponent, SpeciesPieComponent,
    InfoCardComponent, TaxonSynonymsComponent, TaxonNamesComponent,
    BrowseSpeciesComponent, InformalGroupSelectComponent,
    InformalListComponent, InformalListBreadcrumbComponent,
    SelectedParentsComponent,
    TaxonBoldComponent,
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
    AdministrativeStatusComponent,
    TaxonYlestaFieldsComponent,
    TaxonIdentificationComponent,
    IdentificationListComponent
  ],
})
export class TaxonomyModule {
}
