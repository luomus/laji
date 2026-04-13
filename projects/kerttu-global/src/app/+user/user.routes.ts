import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import {
  UserLoginComponent,
  UserLogoutComponent
} from '../../../../laji/src/app/+user';
import { ProfileComponent } from './profile/profile.component';
import { OnlyLoggedIn } from '../../../../laji/src/app/shared/route/only-logged-in';

export const userRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ProfileComponent,
    canActivate: [
      OnlyLoggedIn
    ],
    data: {
      title: 'navigation.user.profile'
    }
  },
  {
    path: 'login',
    pathMatch: 'full',
    component: UserLoginComponent,
    data: {
      loginLanding: '/'
    }
  },
  {
    path: 'logout',
    pathMatch: 'full',
    component: UserLogoutComponent,
    data: {
      loginLanding: '/'
    }
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(userRoutes);
