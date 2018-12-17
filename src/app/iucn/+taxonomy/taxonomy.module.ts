/* tslint:disable:max-line-length */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoCardComponent } from './info-card/info-card.component';
import { TaxonomyComponent } from './taxonomy.component';
import { ListComponent } from './list/list.component';
import { routing } from './taxonomy.routes';
import { SharedModule } from '../../shared/shared.module';
import { TaxonImageComponent } from './info-card/taxon-image/taxon-image.component';
import { TaxonStatusComponent } from './info-card/taxon-status/taxon-status.component';
import { IucnStatusPipe } from './pipe/iucn-status.pipe';
import { TaxonStatusHistoryComponent } from './info-card/taxon-status-history/taxon-status-history.component';
import { RedlistYearSelectComponent } from './info-card/redlist-year-select/redlist-year-select.component';
import { FiltersComponent } from './list/filters/filters.component';
import { SelectComponent } from './list/select/select.component';
import { ResultsComponent } from './list/results/results.component';
import { RedListClassFilterComponent } from './list/filters/red-list-class-filter/red-list-class-filter.component';
import { RedListStatusComponent } from './list/results/red-list-status/red-list-status.component';
import { RedListSpeciesComponent } from './list/results/red-list-species/red-list-species.component';
import { RedListChartComponent } from './list/results/red-list-chart/red-list-chart.component';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import { RedListEvaluationInfoComponent } from './info-card/red-list-evaluation-info/red-list-evaluation-info.component';
import { RedListEvaluationInfoRowsetComponent } from './info-card/red-list-evaluation-info/red-list-evaluation-info-rowset/red-list-evaluation-info-rowset.component';
import { RedListEvaluationOccurrencesComponent } from './info-card/red-list-evaluation-info/red-list-evaluation-occurrences/red-list-evaluation-occurrences.component';
import { RedListHabitatComponent } from './list/results/red-list-habitat/red-list-habitat.component';
import { RedListHabitatListComponent } from './list/results/red-list-habitat/red-list-habitat-list/red-list-habitat-list.component';
/* tslint:enable:max-line-length */

@NgModule({
  imports: [
    routing,
    CommonModule,
    SharedModule,
    NgxChartsModule
  ],
  declarations: [
    InfoCardComponent,
    TaxonomyComponent,
    ListComponent,
    TaxonImageComponent,
    TaxonStatusComponent,
    IucnStatusPipe,
    TaxonStatusHistoryComponent,
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
    RedListEvaluationOccurrencesComponent,
    RedListHabitatComponent,
    RedListHabitatListComponent
  ]
})
export class TaxonomyModule { }
