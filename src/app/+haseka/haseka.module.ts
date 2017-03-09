import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  HasekaComponent,
  routing,
  HaSeKaFormListComponent,
  UsersLatestComponent,
  ShortDocumentComponent,
  HaSeKaFormComponent,
  HaSeKaTermsOfServiceComponent
} from './index';
import { SharedModule } from '../shared/shared.module';
import { AlertModule } from 'ng2-bootstrap';
import { FormApi } from '../shared/api/FormApi';
import { DocumentApi } from '../shared/api/DocumentApi';
import { NamedPlaceModule } from './named-place/named-place.module';

@NgModule({
  imports: [routing, SharedModule, RouterModule, AlertModule, NamedPlaceModule],
  providers: [ FormApi, DocumentApi ],
  declarations: [HasekaComponent, HaSeKaFormListComponent, UsersLatestComponent,
    ShortDocumentComponent, HaSeKaFormComponent, HaSeKaTermsOfServiceComponent]
})
export class HasekaModule {
}
