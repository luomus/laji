import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UsageRoutingModule } from './usage-routing.module';
import { UsageComponent } from './usage.component';
import { TranslateModule } from '@ngx-translate/core';
import { NavigationThumbnailModule } from '../../../../laji/src/app/shared-modules/navigation-thumbnail/navigation-thumbnail.module';
import { UsageByOrganizationComponent } from './pages/usage-by-organization/usage-by-organization.component';
import { UsageDownloadsComponent } from './pages/usage-downloads/usage-downloads.component';
import { OrganizationSelectComponent } from './component/organization-select/organization-select.component';
import { LangModule } from '../../../../laji/src/app/shared-modules/lang/lang.module';
import { DataTableComponent } from './component/data-table/data-table.component';
import { DatatableModule } from '../../../../laji/src/app/shared-modules/datatable/datatable.module';
import { LajiUiModule } from '../../../../laji-ui/src/lib/laji-ui.module';
import { InfoPageModule } from '../../../../laji/src/app/shared-modules/info-page/info-page.module';
import { CollectionSelectComponent } from './component/collection-select/collection-select.component';
import { SharedModule } from '../../../../laji/src/app/shared/shared.module';
import { UsageMyDownloadsComponent } from './pages/usage-my-downloads/usage-my-downloads.component';
import { DownloadRequestModalComponent } from './component/download-request-modal/download-request-modal.component';
import { CopyToClipboardModule } from '../../../../laji/src/app/shared-modules/copy-to-clipboard/copy-to-clipboard.module';
import { DownloadRequestModule } from '../../../../laji/src/app/shared-modules/download-request/download-request.module';
import { UsageAdminComponent } from './pages/usage-admin/usage-admin.component';
import {FindPersonModule} from 'projects/laji/src/app/shared-modules/find-person/find-person.module';

@NgModule({
  declarations: [
    UsageComponent,
    UsageByOrganizationComponent,
    UsageMyDownloadsComponent,
    UsageDownloadsComponent,
    OrganizationSelectComponent,
    CollectionSelectComponent,
    DataTableComponent,
    DownloadRequestModalComponent,
    UsageAdminComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    UsageRoutingModule,
    TranslateModule,
    NavigationThumbnailModule,
    LangModule,
    ReactiveFormsModule,
    DatatableModule,
    LajiUiModule,
    InfoPageModule,
    SharedModule,
    CopyToClipboardModule,
    DownloadRequestModule,
    FindPersonModule
  ]
})
export class UsageModule { }
