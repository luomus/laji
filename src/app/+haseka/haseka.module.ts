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
import { DocumentApi } from '../shared/api/DocumentApi';
import { NamedPlaceModule } from '../shared-modules/named-place/named-place.module';
import { FormPermissionModule } from './form-permission/form-permission.module';
import { DocumentViewerModule } from '../shared-modules/document-viewer/document-viewer.module';
import { FormRowComponent } from './form-list/form-row/form-row.component';
import { LajiMapModule } from '@laji-map/laji-map.module';
import { OwnSubmissionsModule } from '../shared-modules/own-submissions/own-submissions.module';
import { OwnSubmissionsComponent } from './own-submissions/own-submissions.component';
import { TemplatesComponent } from './templates/templates.component';
import { NamedPlaceWrapperComponent } from './named-place-wrapper/named-place-wrapper.component';
import { StatisticsModule } from '../shared-modules/statistics/statistics.module';
import { FormCategoryComponent } from './form-list/form-category/form-category.component';
import { FormCategorySurveyComponent } from './form-list/form-category-survey/form-category-survey.component';
import { LajiFormModule } from '@laji-form/laji-form.module';

@NgModule({
  imports: [routing, SharedModule, RouterModule, AlertModule, NamedPlaceModule, DocumentViewerModule,
    LajiMapModule,
    LajiFormModule,
    OwnSubmissionsModule,
    StatisticsModule,
    FormPermissionModule],
  providers: [ DocumentApi ],
  declarations: [
    HasekaComponent, HaSeKaFormListComponent, UsersLatestComponent,
    ShortDocumentComponent, HaSeKaFormComponent, HaSeKaTermsOfServiceComponent,
    FormRowComponent, OwnSubmissionsComponent, TemplatesComponent,
    NamedPlaceWrapperComponent,
    FormCategoryComponent,
    FormCategorySurveyComponent
  ]
})
export class HasekaModule {
}
