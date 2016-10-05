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

@NgModule({
  imports: [routing, SharedModule, RouterModule, AlertModule],
  declarations: [HasekaComponent, HaSeKaFormListComponent, UsersLatestComponent,
    ShortDocumentComponent, HaSeKaFormComponent, LajiFormComponent, HaSeKaTermsOfServiceComponent]
})
export class HasekaModule {
}
