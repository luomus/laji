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
import { LajiFormComponent } from '../shared/form/laji-form.component';
import { AlertModule } from 'ng2-bootstrap';
import { FormService } from './form/form.service';
import { FormApi } from '../shared/api/FormApi';
import { DocumentApi } from '../shared/api/DocumentApi';

@NgModule({
  imports: [routing, SharedModule, RouterModule, AlertModule],
  providers: [ FormService, FormApi, DocumentApi ],
  declarations: [HasekaComponent, HaSeKaFormListComponent, UsersLatestComponent,
    ShortDocumentComponent, HaSeKaFormComponent, LajiFormComponent, HaSeKaTermsOfServiceComponent]
})
export class HasekaModule {
}
