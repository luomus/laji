import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
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
import { RouterChildrenEventService } from './router-children-event.service';

@NgModule({
  imports: [routing, SharedModule, RouterModule, AlertModule, NgxDatatableModule, NamedPlaceModule, ViewerModule,
    FormPermissionModule.forRoot()],
  providers: [ FormApi, DocumentApi, RouterChildrenEventService ],
  declarations: [HasekaComponent, HaSeKaFormListComponent, UsersLatestComponent,
    ShortDocumentComponent, HaSeKaFormComponent, HaSeKaTermsOfServiceComponent, OwnSubmissionsComponent, StatisticsComponent]
})
export class HasekaModule {
}
