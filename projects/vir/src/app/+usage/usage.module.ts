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


@NgModule({
  declarations: [UsageComponent, UsageByPersonComponent, UsageByCollectionComponent, OrganizationSelectComponent],
    imports: [
        FormsModule,
        CommonModule,
        UsageRoutingModule,
        TranslateModule,
        NavigationThumbnailModule,
        LangModule,
        ReactiveFormsModule
    ]
})
export class UsageModule { }
