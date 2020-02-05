import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../../shared/service/user.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckLoginGuard implements CanActivate {

  private isChecked = false;

  constructor(
    private userService: UserService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean|Observable<boolean> {
    if (this.isChecked || route.queryParams['token'] || !this.userService.getPersistentState().isLoggedIn) {
      this.isChecked = true;
      return true;
    }

    return this.userService.checkLogin();
  }
}
