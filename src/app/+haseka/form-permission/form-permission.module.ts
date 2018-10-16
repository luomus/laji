import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestComponent } from './request/request.component';
import { RequestDescriptionComponent} from './request/request-description/request-description.component';
import { SharedModule } from '../../shared/shared.module';
import { AdminComponent } from './admin/admin.component';
import { IntroComponent } from './admin/intro/intro.component';
import { AcceptComponent } from './admin/accept/accept.component';
import { ManageComponent } from './admin/manage/manage.component';
import { FindPersonModule } from '../../shared-modules/find-person/find-person.module';
import { RequestWrapperComponent } from './request/request-wrapper.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FindPersonModule
  ],
  declarations: [
    AdminComponent,
    RequestComponent,
    RequestDescriptionComponent,
    IntroComponent,
    AcceptComponent,
    ManageComponent,
    RequestWrapperComponent
  ],
  exports: [
    AdminComponent,
    RequestComponent,
    IntroComponent,
    AcceptComponent,
    ManageComponent,
    RequestWrapperComponent
  ]
})
export class FormPermissionModule { }
