import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { UserService } from '../service/user.service';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { PlatformService } from '../../root/platform.service';
import { environment } from 'projects/laji/src/environments/environment';

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

    if (environment.type === 'iucn') {
      this.userService.setNotLoggedIn();
    } else {
      this.userService.login(route.queryParams['token']).subscribe();
    }

    if (route.queryParams['token'] && this.userService.hasReturnUrl()) {
      return this.router.parseUrl(this.userService.getReturnUrl());
    }

    return true;
  }
}
