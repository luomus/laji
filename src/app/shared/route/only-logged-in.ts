import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';

import { UserService } from '../service/user.service';
import { PlatformService } from '../service/platform.service';

@Injectable({providedIn: 'root'})
export class OnlyLoggedIn implements CanActivate {

  constructor(
    private userService: UserService,
    private platformService: PlatformService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.platformService.isServer) {
      return true;
    }
    const isLoggedIn = this.userService.getPersistentState().isLoggedIn;
    if (!isLoggedIn) {
      this.userService.redirectToLogin(state.url, route.data);
      return false;
    }
    return true;
  }

}
