import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UsageRoutingModule } from './usage-routing.module';
import { UsageComponent } from './usage.component';
import { TranslateModule } from '@ngx-translate/core';
import { NavigationThumbnailModule } from '../../../../../src/app/shared-modules/navigation-thumbnail/navigation-thumbnail.module';
import { UsageByOrganizationComponent } from './pages/usage-by-organization/usage-by-organization.component';
import { UsageDownloadsComponent } from './pages/usage-downloads/usage-downloads.component';
import { OrganizationSelectComponent } from './component/organization-select/organization-select.component';
import { LangModule } from '../../../../../src/app/shared-modules/lang/lang.module';
import { DataTableComponent } from './component/data-table/data-table.component';
import { DatatableModule } from '../../../../../src/app/shared-modules/datatable/datatable.module';
import { LajiUiModule } from '../../../../laji-ui/src/lib/laji-ui.module';
import { InfoPageModule } from '../../../../../src/app/shared-modules/info-page/info-page.module';
import { CollectionSelectComponent } from './component/collection-select/collection-select.component';
import { SharedModule } from '../../../../../src/app/shared/shared.module';
import { UsageMyDownloadsComponent } from './pages/usage-my-downloads/usage-my-downloads.component';


@NgModule({
  declarations: [
    UsageComponent,
    UsageByOrganizationComponent,
    UsageMyDownloadsComponent,
    UsageDownloadsComponent,
    OrganizationSelectComponent,
    CollectionSelectComponent,
    DataTableComponent
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
    SharedModule
  ]
})
export class UsageModule { }
