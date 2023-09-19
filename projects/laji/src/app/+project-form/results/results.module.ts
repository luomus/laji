import { NgModule } from '@angular/core';
import { NavigationThumbnailModule } from '../../shared-modules/navigation-thumbnail/navigation-thumbnail.module';
import { TaxonAutocompleteModule } from '../../shared-modules/taxon-autocomplete/taxon-autocomplete.module';
import { ObservationResultModule } from '../../shared-modules/observation-result/observation-result.module';
import { DownloadModalModule } from '../../shared-modules/download-modal/download-modal.module';
import { ChartModule } from '../../shared-modules/chart/chart.module';
import { YkjModule } from '../../shared-modules/ykj/ykj.module';
import { JwBootstrapSwitchNg2Module } from '@servoy/jw-bootstrap-switch-ng2';
import { ResultsComponent } from './results.component';
import { DatatableModule } from '../../shared-modules/datatable/datatable.module';
import { WbcRoutesMapComponent } from './wbc-result/wbc-routes/wbc-routes-map/wbc-routes-map.component';
import { LineTransectResultComponent } from './line-transect-result/line-transect-result.component';
import { LineTransectResultChartComponent } from './line-transect-result/line-transect-result-chart/line-transect-result-chart.component';
import { WbcResultComponent } from './wbc-result/wbc-result.component';
import { WbcSpeciesComponent } from './wbc-result/wbc-species/wbc-species.component';
import { WbcRoutesComponent } from './wbc-result/wbc-routes/wbc-routes.component';
import { WbcCensusesComponent } from './wbc-result/wbc-censuses/wbc-censuses.component';
import { WbcSpeciesListComponent } from './wbc-result/wbc-species/wbc-species-list/wbc-species-list.component';
import { WbcResultFiltersComponent } from './wbc-result/wbc-result-filters/wbc-result-filters.component';
import { WbcSpeciesChartsComponent } from './wbc-result/wbc-species-charts/wbc-species-charts.component';
import { WbcSpeciesMapsComponent } from './wbc-result/wbc-species-charts/wbc-species-maps/wbc-species-maps.component';
import { WbcSpeciesLinechartsComponent } from './wbc-result/wbc-species-charts/wbc-species-linecharts/wbc-species-linecharts.component';
import { WbcRouteComponent } from './wbc-result/wbc-route/wbc-route.component';
import { WbcRouteTableComponent } from './wbc-result/wbc-route-table/wbc-route-table.component';
import { WbcTableFilterComponent } from './wbc-result/wbc-table-filter/wbc-table-filter.component';
import { WbcRoutesListComponent } from './wbc-result/wbc-routes/wbc-routes-list/wbc-routes-list.component';
import { ThemeResultComponent } from './common/theme-result/theme-result.component';
import { ThemeObservationListComponent } from './common/theme-observation-list/theme-observation-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { LajiUiModule } from '../../../../../laji-ui/src/lib/laji-ui.module';
import { routing } from './results.routes';
import { WbcResultService } from './wbc-result/wbc-result.service';
import { SykeInsectResultService } from './syke-insect-result/syke-insect-result.service';
import { TableColumnService } from '../../shared-modules/datatable/service/table-column.service';
import { ObservationTableColumnService } from '../../shared-modules/datatable/service/observation-table-column.service';
import { NafiResultComponent } from './nafi-result/nafi-result.component';
import { ResultService } from './common/service/result.service';
import { NamedPlaceModule } from '../form/named-place/named-place.module';
import { SykeInsectResultComponent } from './syke-insect-result/syke-insect-result.component';
import { SykeInsectRoutesComponent } from './syke-insect-result/syke-insect-routes/syke-insect-routes.component';
import { SykeInsectRoutesListComponent } from './syke-insect-result/syke-insect-routes/syke-insect-routes-list/syke-insect-routes-list.component';
import { SykeInsectResultFiltersComponent } from './syke-insect-result/syke-insect-result-filters/syke-insect-result-filters.component';
import { SykeInsectRouteComponent } from './syke-insect-result/syke-insect-route/syke-insect-route.component';
import { SykeInsectRouteTableComponent } from './syke-insect-result/syke-insect-route-table/syke-insect-route-table.component';
import { SykeInsectAllResultsComponent } from './syke-insect-result/syke-insect-all-results/syke-insect-all-results.component';

@NgModule({
  imports: [
    routing,
    NavigationThumbnailModule,
    ChartModule,
    JwBootstrapSwitchNg2Module,
    YkjModule,
    DatatableModule,
    NamedPlaceModule,
    TaxonAutocompleteModule,
    ObservationResultModule,
    DownloadModalModule,
    TranslateModule,
    CommonModule,
    SharedModule,
    LajiUiModule
  ],
  declarations: [
    ResultsComponent,
    LineTransectResultComponent,
    LineTransectResultChartComponent,
    WbcResultComponent,
    WbcSpeciesComponent,
    WbcRoutesComponent,
    WbcCensusesComponent,
    WbcSpeciesListComponent,
    WbcResultFiltersComponent,
    WbcSpeciesChartsComponent,
    WbcSpeciesMapsComponent,
    WbcSpeciesLinechartsComponent,
    WbcRouteComponent,
    WbcRouteTableComponent,
    WbcTableFilterComponent,
    WbcRoutesListComponent,
    WbcRoutesMapComponent,
    ThemeResultComponent,
    ThemeObservationListComponent,
    NafiResultComponent,
    SykeInsectResultComponent,
    SykeInsectRoutesComponent,
    SykeInsectRoutesListComponent,
    SykeInsectResultFiltersComponent,
    SykeInsectRouteComponent,
    SykeInsectRouteTableComponent,
    SykeInsectAllResultsComponent
  ],
  providers: [
    WbcResultService,
    SykeInsectResultService,
    {provide: TableColumnService, useClass: ObservationTableColumnService},
    ResultService
  ]
})
export class ResultsModule {
}
