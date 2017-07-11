import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NouisliderModule } from 'ng2-nouislider';
import {
  HasekaComponent,
  HaSeKaFormComponent,
  HaSeKaFormListComponent,
  HaSeKaTermsOfServiceComponent,
  routing,
  ShortDocumentComponent,
  UsersLatestComponent
} from './index';
import { SharedModule } from '../shared/shared.module';
import { AlertModule } from 'ngx-bootstrap';
import { FormApi } from '../shared/api/FormApi';
import { DocumentApi } from '../shared/api/DocumentApi';
import { NamedPlaceModule } from './named-place/named-place.module';
import { FormPermissionModule } from './form-permission/form-permission.module';
import { OwnSubmissionsComponent } from './own-submissions/own-submissions.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { ViewerModule } from '../+viewer/viewer.module';
import { OwnDatatableComponent } from './own-submissions/own-datatable/own-datatable.component';
import { LineTransectComponent } from './statistics/line-transect/line-transect.component';
import { LineTransectChartComponent } from './statistics/line-transect/line-transect-chart/line-transect-chart.component';
import { YearSliderComponent } from './own-submissions/year-slider/year-slider.component';
import { FilterColumnsPipe } from './own-submissions/own-datatable/filter-columns.pipe';
import { FormRowComponent } from './form-list/form-row/form-row.component';

@NgModule({
  imports: [routing, SharedModule, RouterModule, AlertModule, NgxDatatableModule, NouisliderModule, NamedPlaceModule, ViewerModule,
    FormPermissionModule],
  providers: [ FormApi, DocumentApi ],
  declarations: [
    HasekaComponent, HaSeKaFormListComponent, UsersLatestComponent,
    ShortDocumentComponent, HaSeKaFormComponent, HaSeKaTermsOfServiceComponent, OwnSubmissionsComponent, OwnDatatableComponent,
    StatisticsComponent, LineTransectComponent, LineTransectChartComponent, YearSliderComponent, FilterColumnsPipe, FormRowComponent
  ]
})
export class HasekaModule {
}
