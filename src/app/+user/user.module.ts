import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FriendsComponent, ProfileComponent, routing, UserComponent, UserLoginComponent, UserLogoutComponent } from './index';
import { TypeaheadModule } from 'ngx-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { FindPersonModule } from '../shared-modules/find-person/find-person.module';
import { UserLoginGuard } from './login/user-login.guard';

@NgModule({
  providers: [
    UserLoginGuard
  ],
  imports: [
    routing,
    SharedModule,
    RouterModule,
    TypeaheadModule,
    FindPersonModule
  ],
  declarations: [UserComponent, ProfileComponent, FriendsComponent, UserLoginComponent, UserLogoutComponent]
})
export class UserModule {
}
