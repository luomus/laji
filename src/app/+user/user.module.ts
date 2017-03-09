import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  UserComponent,
  ProfileComponent,
  FriendsComponent,
  routing,
  UserLoginComponent,
  UserLogoutComponent
} from './index';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [routing, SharedModule, RouterModule],
  declarations: [UserComponent, ProfileComponent, FriendsComponent, UserLoginComponent, UserLogoutComponent]
})
export class UserModule {
}
