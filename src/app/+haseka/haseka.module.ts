import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  HasekaComponent,
  HaSeKaFormComponent,
  HaSeKaFormListComponent,
  HaSeKaTermsOfServiceComponent,
  routing,
  ShortDocumentComponent,
  UsersLatestComponent
} from './index';
import { SharedModule } from '../shared/shared.module';
import { AlertModule } from 'ngx-bootstrap';
import { FormApi } from '../shared/api/FormApi';
import { DocumentApi } from '../shared/api/DocumentApi';
import { NamedPlaceModule } from './named-place/named-place.module';
import { FormPermissionModule } from './form-permission/form-permission.module';

@NgModule({
  imports: [routing, SharedModule, RouterModule, AlertModule, NamedPlaceModule, FormPermissionModule.forRoot()],
  providers: [ FormApi, DocumentApi ],
  declarations: [HasekaComponent, HaSeKaFormListComponent, UsersLatestComponent,
    ShortDocumentComponent, HaSeKaFormComponent, HaSeKaTermsOfServiceComponent]
})
export class HasekaModule {
}
