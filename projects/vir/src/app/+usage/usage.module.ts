import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsageRoutingModule } from './usage-routing.module';
import { UsageComponent } from './usage.component';
import { TranslateModule } from '@ngx-translate/core';
import { NavigationThumbnailModule } from '../../../../../src/app/shared-modules/navigation-thumbnail/navigation-thumbnail.module';
import { UsageByPersonComponent } from './pages/usage-by-person/usage-by-person.component';
import { UsageByCollectionComponent } from './pages/usage-by-collection/usage-by-collection.component';
import { OrganizationSelectComponent } from './component/organization-select/organization-select.component';


@NgModule({
  declarations: [UsageComponent, UsageByPersonComponent, UsageByCollectionComponent, OrganizationSelectComponent],
  imports: [
    CommonModule,
    UsageRoutingModule,
    TranslateModule,
    NavigationThumbnailModule
  ]
})
export class UsageModule { }
