import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  FriendsComponent,
  ProfileComponent,
  routing,
  UserComponent,
  UserLoginComponent,
  UserLogoutComponent
} from './index';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { SharedModule } from '../shared/shared.module';
import { FindPersonModule } from '../shared-modules/find-person/find-person.module';
import { InfoModule } from '../shared-modules/info/info.module';

@NgModule({
    imports: [
        routing,
        SharedModule,
        RouterModule,
        TypeaheadModule,
        FindPersonModule,
        InfoModule
    ],
  declarations: [UserComponent, ProfileComponent, FriendsComponent, UserLoginComponent, UserLogoutComponent]
})
export class UserModule {
}
