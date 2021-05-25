/* tslint:disable:max-line-length */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InfoCardComponent } from './info-card/info-card.component';
import { TaxonomyComponent } from './taxonomy.component';
import { ListComponent } from './list/list.component';
import { routing } from './taxonomy.routes';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { TaxonImageComponent } from './info-card/taxon-image/taxon-image.component';
import { TaxonStatusComponent } from './info-card/taxon-status/taxon-status.component';
import { RedlistYearSelectComponent } from './info-card/redlist-year-select/redlist-year-select.component';
import { ResultsComponent } from './list/results/results.component';
import { RedListStatusComponent } from './list/results/red-list-status/red-list-status.component';
import { RedListChartComponent } from './list/results/red-list-chart/red-list-chart.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { RedListEvaluationInfoComponent } from './info-card/red-list-evaluation-info/red-list-evaluation-info.component';
import { RedListEvaluationInfoRowsetComponent } from './info-card/red-list-evaluation-info/red-list-evaluation-info-rowset/red-list-evaluation-info-rowset.component';
import { RedListHabitatComponent } from './list/results/red-list-habitat/red-list-habitat.component';
import { RedListHabitatListComponent } from './list/results/red-list-habitat/red-list-habitat-list/red-list-habitat-list.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { IucnSharedModule } from '../iucn-shared/shared.module';
import { IucnCommonModule } from '../../../../laji/src/app/shared-modules/iucn/iucn.module';
import { TaxonOccurrencesComponent } from './info-card/taxon-occurrences/taxon-occurrences.component';

/* tslint:enable:max-line-length */

@NgModule({
  imports: [
    routing,
    CommonModule,
    SharedModule,
    IucnSharedModule,
    NgxChartsModule,
    NgSelectModule,
    IucnCommonModule
  ],
  declarations: [
    InfoCardComponent,
    TaxonomyComponent,
    ListComponent,
    TaxonImageComponent,
    TaxonStatusComponent,
    RedlistYearSelectComponent,
    ResultsComponent,
    RedListStatusComponent,
    RedListChartComponent,
    RedListEvaluationInfoComponent,
    RedListEvaluationInfoRowsetComponent,
    RedListHabitatComponent,
    RedListHabitatListComponent,
    TaxonOccurrencesComponent
  ]
})
export class IucnTaxonomyModule { }
