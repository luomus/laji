import { NgModule } from '@angular/core';
import { routing } from './project-form.routes';
import { ProjectFormComponent } from './project-form.component';
import { CommonModule } from '@angular/common';
import { LajiUiModule } from '../../../../laji-ui/src/lib/laji-ui.module';
import { SharedModule } from '../shared/shared.module';
import { LatestDocumentsModule } from '../shared-modules/latest-documents/latest-documents.module';
import { AboutComponent } from './about/about.component';
import { InfoPageModule } from '../shared-modules/info-page/info-page.module';
import { DatasetAboutComponent } from './about/dataset-about/dataset-about.component';
import { LajiFormModule } from 'projects/laji/src/app/+project-form/form/laji-form/laji-form.module';
import { InstructionsComponent } from './instructions/instructions.component';
import { FormPermissionModule } from './form-permission/form-permission.module';
import { SubmissionsComponent } from './submissions/submissions.component';
import { OwnSubmissionsModule } from '../shared-modules/own-submissions/own-submissions.module';
import { ImportComponent } from './import/import.component';
import { GenerateSpreadsheetComponent } from './generate-spreadsheet/generate-spreadsheet.component';
import { SpreadsheetModule } from '../shared-modules/spreadsheet/spreadsheet.module';
import { TemplatesComponent } from './templates/templates.component';
import { TermsComponent } from './about/terms/terms.component';
import { StatisticsModule } from './submissions/statistics/statistics.module';
import { HasAdminPermission } from './guards/has-admin-permission';
import { HasFormPermission } from './guards/has-form-permission';
import { HasViewPermission } from './guards/has-view-permission';
import { DisabledComponent } from './disabled/disabled.component';
import { BreadcrumbModule } from '../shared-modules/breadcrumb/breadcrumb.module';
import { TechnicalNewsModule } from '../shared-modules/technical-news/technical-news.module';
import { ProjectFormHeaderModule } from './header/project-form-header.module';
import { ModalModule } from 'projects/laji-ui/src/lib/modal/modal.module';
import { ThankYouComponent } from './thank-you/thank-you.component';

@NgModule({
  imports: [
    routing,
    CommonModule,
    SharedModule,
    LajiUiModule,
    LatestDocumentsModule,
    InfoPageModule,
    FormPermissionModule,
    LajiFormModule,
    OwnSubmissionsModule,
    SpreadsheetModule,
    StatisticsModule,
    ProjectFormHeaderModule,
    BreadcrumbModule,
    TechnicalNewsModule,
    ModalModule
  ],
  declarations: [
    ProjectFormComponent,
    AboutComponent,
    DatasetAboutComponent,
    InstructionsComponent,
    SubmissionsComponent,
    ImportComponent,
    GenerateSpreadsheetComponent,
    TemplatesComponent,
    TermsComponent,
    DisabledComponent,
    ThankYouComponent
  ],
  providers: [
    HasAdminPermission,
    HasFormPermission,
    HasViewPermission
  ]
})
export class ProjectFormModule {
}
