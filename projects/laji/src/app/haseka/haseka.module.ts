import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { DocumentViewerModule } from '../shared-modules/document-viewer/document-viewer.module';
import { LajiMapModule } from 'projects/laji/src/app/shared-modules/laji-map/laji-map.module';
import { OwnSubmissionsModule } from '../shared-modules/own-submissions/own-submissions.module';
import { OwnSubmissionsComponent } from './own-submissions/own-submissions.component';
import { TemplatesComponent } from './templates/templates.component';
import { HasekaComponent } from './haseka.component';
import { routing } from './haseka.routes';
import { LatestDocumentsModule } from '../shared-modules/latest-documents/latest-documents.module';
import { HasekaTermsComponent } from './terms/haseka-terms.component';
import { AppComponentModule } from '../shared-modules/app-component/app-component.module';
import { LajiUiModule } from '../../../../laji-ui/src/public-api';
import { VihkoHomeComponent } from './vihko-home/vihko-home.component';
import { TechnicalNewsModule } from '../shared-modules/technical-news/technical-news.module';
import { AlertModule } from 'projects/laji-ui/src/lib/alert/alert.module';


@NgModule({
  imports: [
    routing,
    SharedModule,
    RouterModule,
    AlertModule,
    DocumentViewerModule,
    LajiMapModule,
    OwnSubmissionsModule,
    LatestDocumentsModule,
    AppComponentModule,
    LajiUiModule,
    TechnicalNewsModule
  ],
  declarations: [
    HasekaComponent,
    OwnSubmissionsComponent, TemplatesComponent,
    HasekaTermsComponent,
    VihkoHomeComponent,
  ]
})
export class HasekaModule {
}
