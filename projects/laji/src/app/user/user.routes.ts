import { RouterModule, Routes } from '@angular/router';
import { ProfilePleaseLoginComponent } from './profile/profile-please-login.component';
import { UserLoginComponent } from './login/user-login.component';
import { UserLogoutComponent } from './logout/user-logout.component';
import { ProfileComponent } from './profile/profile.component';
import { ModuleWithProviders } from '@angular/core';
import { ProfileRedirectGuard } from './profile/profile-redirect-guard.service';

export const userRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ProfilePleaseLoginComponent,
    canActivate: [
      ProfileRedirectGuard
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
  },
  {
    path: ':userId',
    pathMatch: 'full',
    component: ProfileComponent,
    data: {
      title: 'navigation.user.profile'
    }
  }
];

export const routing: ModuleWithProviders<RouterModule> = RouterModule.forChild(userRoutes);
