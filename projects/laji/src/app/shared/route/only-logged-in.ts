import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { UserService } from '../service/user.service';
import { PlatformService } from '../../root/platform.service';
import { take, tap } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class OnlyLoggedIn  {
  constructor(
    private userService: UserService,
    private platformService: PlatformService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.platformService.isServer) {
      return true;
    }
    return this.userService.isLoggedIn$.pipe(
      take(1),
      tap(isLoggedIn => {
        if (!isLoggedIn) {
          this.userService.redirectToLogin(state.url, route.data);
        }
      })
    );
  }

}
