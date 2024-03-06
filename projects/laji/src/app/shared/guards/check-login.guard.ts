import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { UserService } from '../service/user.service';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { PlatformService } from '../../root/platform.service';

@Injectable({
  providedIn: 'root'
})
export class CheckLoginGuard  {

  private isLoginChecked = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private location: Location,
    private platformService: PlatformService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): UrlTree | boolean | Observable<boolean> {
    // queryparams removed in SSR
    if (this.platformService.isServer) {
      this.location.replaceState(this.location.path().split('?')[0], '');
      return true;
    }

    // continue normally if login has already been checked
    if (this.isLoginChecked) {
      return true;
    }
    this.isLoginChecked = true;

    this.userService.login(route.queryParams['token']).subscribe();

    if (this.userService.hasReturnUrl()) {
      return this.router.parseUrl(this.userService.getReturnUrl());
    }

    return true;
  }
}
