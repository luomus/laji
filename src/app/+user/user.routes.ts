import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { UserLoginComponent } from './login/user-login.component';
import { UserLogoutComponent } from './logout/user-logout.component';
import { ProfileComponent } from './profile/profile.component';
import { ModuleWithProviders } from '@angular/core';
import { UserLoginGuard } from './login/user-login.guard';

export const userRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: UserComponent
  },
  {
    path: 'login',
    pathMatch: 'full',
    component: UserLoginComponent,
    canActivate: [UserLoginGuard]
  },
  {
    path: 'logout',
    pathMatch: 'full',
    component: UserLogoutComponent
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

export const routing: ModuleWithProviders = RouterModule.forChild(userRoutes);
