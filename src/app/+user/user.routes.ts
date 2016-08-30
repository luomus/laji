import { RouterConfig } from '@angular/router';

import {UserComponent } from "./user.component";
import {UserLoginComponent} from "./login/user-login.component";
import {UserLogoutComponent} from "./logout/user-logout.component";

export const UserRoutes:RouterConfig = [
  {
    path: 'user',
    component: UserComponent
  },
  {
    path: 'user/login',
    component: UserLoginComponent
  },
  {
    path: 'user/logout',
    component: UserLogoutComponent
  }
];
