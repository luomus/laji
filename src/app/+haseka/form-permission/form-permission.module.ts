import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestComponent } from './request/request.component';
import { FormPermissionApi } from '../../shared/api/FormPermissionApi';
import { SharedModule } from '../../shared/shared.module';
import { FormPermissionService } from './form-permission.service';
import { AdminComponent } from './admin/admin.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [
    AdminComponent,
    RequestComponent
  ],
  exports: [
    AdminComponent,
    RequestComponent
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
