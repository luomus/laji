import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestComponent } from './request/request.component';
import { FormPermissionApi } from '../../shared/api/FormPermissionApi';
import { SharedModule } from '../../shared/shared.module';
import { FormPermissionService } from './form-permission.service';
import { AdminComponent } from './admin/admin.component';
import { IntroComponent } from './admin/intro/intro.component';
import { AcceptComponent } from './admin/accept/accept.component';
import { ManageComponent } from './admin/manage/manage.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    AdminComponent,
    RequestComponent,
    IntroComponent,
    AcceptComponent,
    ManageComponent
  ],
  exports: [
    AdminComponent,
    RequestComponent,
    IntroComponent,
    AcceptComponent,
    ManageComponent
  ]
})
export class FormPermissionModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: FormPermissionModule,
      providers: [
        FormPermissionApi,
        FormPermissionService
      ]
    };
  }
}
