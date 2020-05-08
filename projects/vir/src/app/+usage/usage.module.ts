import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UsageRoutingModule } from './usage-routing.module';
import { UsageComponent } from './usage.component';
import { TranslateModule } from '@ngx-translate/core';
import { NavigationThumbnailModule } from '../../../../../src/app/shared-modules/navigation-thumbnail/navigation-thumbnail.module';
import { UsageByPersonComponent } from './pages/usage-by-person/usage-by-person.component';
import { UsageByCollectionComponent } from './pages/usage-by-collection/usage-by-collection.component';
import { OrganizationSelectComponent } from './component/organization-select/organization-select.component';
import { LangModule } from '../../../../../src/app/shared-modules/lang/lang.module';
import { DataTableComponent } from './component/data-table/data-table.component';
import { DatatableModule } from '../../../../../src/app/shared-modules/datatable/datatable.module';
import { LajiUiModule } from '../../../../laji-ui/src/lib/laji-ui.module';


@NgModule({
  declarations: [
      UsageComponent,
      UsageByPersonComponent,
      UsageByCollectionComponent,
      OrganizationSelectComponent,
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
    LajiUiModule
  ]
})
export class UsageModule { }
