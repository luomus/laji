import { Injectable } from '@angular/core';
import { CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree } from '@angular/router';
import { UserService } from '../../shared/service/user.service';
import { Location } from '@angular/common';

@Injectable()
export class UserLoginGuard implements CanActivate {

  constructor(
    private router: Router,
    private userService: UserService,
    private location: Location
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (!route.queryParams['token']) {
      return this.router.parseUrl('/error/404');
    }
    this.location.replaceState('/', '');
    this.userService.login(route.queryParams['token']);
    return this.router.parseUrl(this.userService.getReturnUrl());
  }
}
