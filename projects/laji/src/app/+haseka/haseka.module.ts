import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { AlertModule } from 'ngx-bootstrap/alert';
import { DocumentViewerModule } from '../shared-modules/document-viewer/document-viewer.module';
import { LajiMapModule } from '@laji-map/laji-map.module';
import { OwnSubmissionsModule } from '../shared-modules/own-submissions/own-submissions.module';
import { OwnSubmissionsComponent } from './own-submissions/own-submissions.component';
import { TemplatesComponent } from './templates/templates.component';
import { LajiFormModule } from '@laji-form/laji-form.module';
import { HasekaComponent } from './haseka.component';
import { routing } from './haseka.routes';
import { HaSeKaFormComponent } from './form/haseka-form.component';
import { HaSeKaTermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { LatestDocumentsModule } from '../shared-modules/latest-documents/latest-documents.module';
import { HasekaTermsComponent } from './terms/haseka-terms.component';
import { HasekaFeedbackComponent } from './haseka-feedback/haseka-feedback.component';
import { AppComponentModule } from '../shared-modules/app-component/app-component.module';
import { LajiUiModule } from '../../../../laji-ui/src/public-api';
import { VihkoHomeComponent } from './vihko-home/vihko-home.component';
import { SurveyBoxModule } from '../shared-modules/survey-box/survey-box.module';
import { TechnicalNewsModule } from '../shared-modules/technical-news/technical-news.module';
import { TemplateHasekaFormComponent } from './template-haseka-form/template-haseka-form.component';


@NgModule({
  imports: [
    routing,
    SharedModule,
    RouterModule,
    AlertModule,
    DocumentViewerModule,
    LajiMapModule,
    LajiFormModule,
    OwnSubmissionsModule,
    LatestDocumentsModule,
    AppComponentModule,
    LajiUiModule,
    SurveyBoxModule,
    TechnicalNewsModule
  ],
  declarations: [
    HasekaComponent, HaSeKaFormComponent, HaSeKaTermsOfServiceComponent,
    OwnSubmissionsComponent, TemplatesComponent,
    HasekaTermsComponent,
    HasekaFeedbackComponent,
    VihkoHomeComponent,
    TemplateHasekaFormComponent,
  ]
})
export class HasekaModule {
}
