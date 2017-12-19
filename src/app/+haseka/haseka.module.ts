import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
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
import { NamedPlaceModule } from '../shared-modules/named-place/named-place.module';
import { FormPermissionModule } from './form-permission/form-permission.module';
import { StatisticsComponent } from './statistics/statistics.component';
import { ViewerModule } from '../+viewer/viewer.module';
import { LineTransectComponent } from './statistics/line-transect/line-transect.component';
import { LineTransectChartComponent } from './statistics/line-transect/line-transect-chart/line-transect-chart.component';
import { FormRowComponent } from './form-list/form-row/form-row.component';
import { LajiMapModule } from '../shared-modules/map/laji-map.module';
import { OwnSubmissionsModule } from '../shared-modules/own-submissions/own-submissions.module';
import { OwnSubmissionsComponent } from './own-submissions/own-submissions.component';
import { TemplatesComponent } from './templates/templates.component';
import { NamedPlaceWrapperComponent } from './named-place-wrapper/named-place-wrapper.component';

@NgModule({
  imports: [routing, SharedModule, RouterModule, AlertModule, NamedPlaceModule, ViewerModule,
    LajiMapModule,
    OwnSubmissionsModule,
    FormPermissionModule],
  providers: [ FormApi, DocumentApi ],
  declarations: [
    HasekaComponent, HaSeKaFormListComponent, UsersLatestComponent,
    ShortDocumentComponent, HaSeKaFormComponent, HaSeKaTermsOfServiceComponent,
    StatisticsComponent, LineTransectComponent, LineTransectChartComponent, FormRowComponent, OwnSubmissionsComponent, TemplatesComponent,
    NamedPlaceWrapperComponent
  ]
})
export class HasekaModule {
}
