import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThemeRoutingModule } from './theme-routing.module';
import { NafiComponent } from './nafi/nafi.component';
import { HerpetologyComponent } from './herpetology/herpetology.component';
import { SharedModule } from '../shared/shared.module';
import { ThemeResultComponent } from './theme-result/theme-result.component';
import { NafiResultComponent } from './nafi/nafi-result/nafi-result.component';
import { ResultService } from './service/result.service';
import { FixedTableDirective } from './directive/fixed-table.directive';
import { ThemeObservationListComponent } from './theme-observation-list/theme-observation-list.component';
import { NafiFormComponent } from './nafi/nafi-form/nafi-form.component';
import { NafiMyDocumentListComponent } from './nafi/nafi-my-document-list/nafi-my-document-list.component';
import { ThemeMyDocumentListComponent } from './theme-my-document-list/theme-my-document-list.component';
import { NafiInstructionsComponent } from './nafi/nafi-instructions/nafi-instructions.component';
import { DocumentViewerModule } from '../shared-modules/document-viewer/document-viewer.module';
import { YkjComponent } from './ykj/ykj.component';
import { EmkComponent } from './emk/emk.component';
import { WbcComponent } from './wbc/wbc.component';
import { WbcFormComponent } from './wbc/wbc-form/wbc-form.component';
import { WbcResultComponent } from './wbc/wbc-result/wbc-result.component';
import { WbcInstructionsComponent } from './wbc/wbc-instructions/wbc-instructions.component';
import { LangModule } from '../shared-modules/lang/lang.module';
import { YkjModule } from '../shared-modules/ykj/ykj.module';
import { ObservationResultModule } from '../shared-modules/observation-result/observation-result.module';
import { OwnSubmissionsModule } from '../shared-modules/own-submissions/own-submissions.module';
import { WbcOwnSubmissionsComponent } from './wbc/wbc-own-submissions/wbc-own-submissions.component';
import { IdentifyComponent } from './identify/identify.component';
import { NafiTemplatesComponent } from './nafi/nafi-templates/nafi-templates.component';
import { NamedPlaceModule } from '../shared-modules/named-place/named-place.module';
import { ThemeComponent } from './theme.component';
import { LineTransectComponent } from './line-transect/line-transect.component';
import { LineTransectResultComponent } from './line-transect/line-transect-result/line-transect-result.component';
import { LineTransectResultGridComponent } from './line-transect/line-transect-result/line-transect-result-grid/line-transect-result-grid.component';
import { LineTransectResultChartComponent } from './line-transect/line-transect-result/line-transect-result-chart/line-transect-result-chart.component';
import { LineTransectFormComponent } from './line-transect/line-transect-form/line-transect-form.component';
import { LineTransectInstructionsComponent } from './line-transect/line-transect-instructions/line-transect-instructions.component';
import { LineTransectMyDocumentListComponent } from './line-transect/line-transect-my-document-list/line-transect-my-document-list.component';
import { StatisticsModule } from '../shared-modules/statistics/statistics.module';
import { DatatableModule } from '../shared-modules/datatable/datatable.module'
import { QualityService } from './service/quality.service';
import { QualityComponent } from './quality/quality.component';
import { MostActiveUsersTableComponent } from './quality/most-active-users-table/most-active-users-table.component';
import { AnnotationTableComponent } from './quality/annotation-table/annotation-table.component';
import { QualityFiltersComponent } from './quality/quality-filters/quality-filters.component';
import { TaxonAutocompleteModule } from '../shared-modules/taxon-autocomplete/taxon-autocomplete.module';
import { LineTransectFormEiVakioComponent } from './line-transect/line-transect-form-ei-vakio/line-transect-form-ei-vakio.component';
import { LineTransectFormKartoitusComponent } from './line-transect/line-transect-form-kartoitus/line-transect-form-kartoitus.component';
import { LajiFormModule } from '@laji-form/laji-form.module';
import { ObservationMapModule } from '../shared-modules/observation-map/observation-map.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  imports: [
    CommonModule,
    ThemeRoutingModule,
    SharedModule,
    DocumentViewerModule,
    LangModule,
    YkjModule,
    ObservationResultModule,
    OwnSubmissionsModule,
    NamedPlaceModule,
    StatisticsModule,
    DatatableModule,
    TaxonAutocompleteModule,
    LajiFormModule,
    ObservationMapModule,
    NgxChartsModule
  ],
  declarations: [
    NafiComponent,
    HerpetologyComponent,
    ThemeResultComponent,
    NafiResultComponent,
    FixedTableDirective,
    ThemeObservationListComponent,
    NafiFormComponent,
    NafiMyDocumentListComponent,
    ThemeMyDocumentListComponent,
    NafiInstructionsComponent,
    YkjComponent,
    EmkComponent,
    WbcComponent,
    WbcFormComponent,
    WbcResultComponent,
    WbcInstructionsComponent,
    WbcOwnSubmissionsComponent,
    LineTransectComponent,
    LineTransectResultComponent,
    LineTransectResultGridComponent,
    LineTransectResultChartComponent,
    LineTransectFormComponent,
    LineTransectInstructionsComponent,
    LineTransectMyDocumentListComponent,
    IdentifyComponent,
    NafiTemplatesComponent,
    ThemeComponent,
    QualityComponent,
    MostActiveUsersTableComponent,
    AnnotationTableComponent,
    QualityFiltersComponent,
    LineTransectFormEiVakioComponent,
    LineTransectFormKartoitusComponent
  ],
  providers: [ ResultService, QualityService ]
})
export class ThemeModule { }
