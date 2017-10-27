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
import { TypeaheadModule } from 'ngx-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { FindPersonComponent } from './profile/find-person/find-person.component';

@NgModule({
  imports: [routing, SharedModule, RouterModule,
    TypeaheadModule],
  declarations: [UserComponent, ProfileComponent, FriendsComponent, UserLoginComponent, UserLogoutComponent, FindPersonComponent]
})
export class UserModule {
}
