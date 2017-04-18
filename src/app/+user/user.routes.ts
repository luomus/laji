import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { UserLoginComponent } from './login/user-login.component';
import { UserLogoutComponent } from './logout/user-logout.component';
import { ProfileComponent } from './profile/profile.component';
import { ModuleWithProviders } from '@angular/core';

export const userRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: UserComponent
  },
  {
    path: 'login',
    pathMatch: 'full',
    component: UserLoginComponent
  },
  {
    path: 'logout',
    pathMatch: 'full',
    component: UserLogoutComponent
  },
  {
    path: ':userId',
    pathMatch: 'full',
    component: ProfileComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(userRoutes);
