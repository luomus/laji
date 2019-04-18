/* tslint:disable:max-line-length */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoCardComponent } from './info-card/info-card.component';
import { TaxonomyComponent } from './taxonomy.component';
import { ListComponent } from './list/list.component';
import { routing } from './taxonomy.routes';
import { SharedModule } from '../../../../../src/app/shared/shared.module';
import { TaxonImageComponent } from './info-card/taxon-image/taxon-image.component';
import { TaxonStatusComponent } from './info-card/taxon-status/taxon-status.component';
import { RedlistYearSelectComponent } from './info-card/redlist-year-select/redlist-year-select.component';
import { FiltersComponent } from './list/filters/filters.component';
import { SelectComponent } from './list/select/select.component';
import { ResultsComponent } from './list/results/results.component';
import { RedListClassFilterComponent } from './list/filters/red-list-class-filter/red-list-class-filter.component';
import { RedListStatusComponent } from './list/results/red-list-status/red-list-status.component';
import { RedListSpeciesComponent } from './list/results/red-list-species/red-list-species.component';
import { RedListChartComponent } from './list/results/red-list-chart/red-list-chart.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { RedListEvaluationInfoComponent } from './info-card/red-list-evaluation-info/red-list-evaluation-info.component';
import { RedListEvaluationInfoRowsetComponent } from './info-card/red-list-evaluation-info/red-list-evaluation-info-rowset/red-list-evaluation-info-rowset.component';
import { RedListHabitatComponent } from './list/results/red-list-habitat/red-list-habitat.component';
import { RedListHabitatListComponent } from './list/results/red-list-habitat/red-list-habitat-list/red-list-habitat-list.component';
import { TaxonSelectModule } from '../../../../../src/app/shared-modules/taxon-select/taxon-select.module';
import { DatatableModule } from '../../../../../src/app/shared-modules/datatable/datatable.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ActiveFiltersComponent } from './list/active-filters/active-filters.component';
import { IucnSharedModule } from '../iucn-shared/shared.module';
import { SelectFieldsModule } from '../../../../../src/app/shared-modules/select-fields/select-fields.module';
import { DownloadModule } from '../../../../../src/app/shared-modules/download/download.module';
import { IucnCommonModule } from '../../../../../src/app/shared-modules/iucn/iucn.module';
/* tslint:enable:max-line-length */

@NgModule({
  imports: [
    routing,
    CommonModule,
    SharedModule,
    IucnSharedModule,
    NgxChartsModule,
    TaxonSelectModule,
    DatatableModule,
    NgSelectModule,
    SelectFieldsModule,
    DownloadModule,
    IucnCommonModule
  ],
  declarations: [
    InfoCardComponent,
    TaxonomyComponent,
    ListComponent,
    TaxonImageComponent,
    TaxonStatusComponent,
    RedlistYearSelectComponent,
    FiltersComponent,
    SelectComponent,
    ResultsComponent,
    RedListClassFilterComponent,
    RedListStatusComponent,
    RedListSpeciesComponent,
    RedListChartComponent,
    RedListEvaluationInfoComponent,
    RedListEvaluationInfoRowsetComponent,
    RedListHabitatComponent,
    RedListHabitatListComponent,
    ActiveFiltersComponent
  ]
})
export class IucnTaxonomyModule { }
