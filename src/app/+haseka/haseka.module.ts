import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { AlertModule } from 'ngx-bootstrap';
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
import { HasekaComponent } from './haseka.component';
import { HaSeKaFormListComponent } from './form-list/haseka-form-list';
import { routing } from './haseka.routes';
import { HaSeKaFormComponent } from './form/haseka-form.component';
import { HaSeKaTermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { LatestDocumentsModule } from '../shared-modules/latest-documents/latest-documents.module';
import { HasekaTermsComponent } from './terms/haseka-terms.component';

@NgModule({
  imports: [
    routing,
    SharedModule,
    RouterModule,
    AlertModule,
    NamedPlaceModule,
    DocumentViewerModule,
    LajiMapModule,
    LajiFormModule,
    OwnSubmissionsModule,
    StatisticsModule,
    FormPermissionModule,
    LatestDocumentsModule
  ],
  declarations: [
    HasekaComponent, HaSeKaFormListComponent, HaSeKaFormComponent, HaSeKaTermsOfServiceComponent,
    FormRowComponent, OwnSubmissionsComponent, TemplatesComponent,
    NamedPlaceWrapperComponent,
    FormCategoryComponent,
    FormCategorySurveyComponent,
    HasekaTermsComponent
  ]
})
export class HasekaModule {
}
