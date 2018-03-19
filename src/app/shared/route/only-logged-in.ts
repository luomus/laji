import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../service/user.service';

@Injectable()
export class OnlyLoggedIn implements CanActivate {

  constructor(private userService: UserService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean>
    | Promise<boolean>
    | boolean {
    if (!this.userService.isLoggedIn) {
      this.userService.doLogin(state.url);
    }
    return this.userService.isLoggedIn;
  }

}
