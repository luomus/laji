import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { UserService } from '../service/user.service';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { PlatformService } from '../service/platform.service';
import { WINDOW } from '@ng-toolkit/universal';

@Injectable({
  providedIn: 'root'
})
export class CheckLoginGuard implements CanActivate {

  private isChecked = false;

  constructor(
    @Inject(WINDOW) private window,
    private router: Router,
    private userService: UserService,
    private location: Location,
    private platformService: PlatformService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): UrlTree|boolean|Observable<boolean> {
    if (this.platformService.isServer) {
      this.location.replaceState(this.location.path().split('?')[0], '');
      return true;
    }
    if (!this.isChecked && route.queryParams['token']) {
      if (this.window.top !== this.window.self) {
        return this.router.parseUrl('/user/check?token=' + route.queryParams['token']);
      }

      this.isChecked = true;
      this.location.replaceState(this.location.path().split('?')[0], '');
      this.userService.login(route.queryParams['token']).subscribe();

      return this.router.parseUrl(this.userService.getReturnUrl());
    }

    if (this.isChecked) {
      return true;
    }

    return this.userService.checkLogin();
  }
}
