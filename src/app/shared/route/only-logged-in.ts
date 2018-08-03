import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../service/user.service';
import { tap } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class OnlyLoggedIn implements CanActivate {

  constructor(private userService: UserService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean>
    | Promise<boolean>
    | boolean {
    return this.userService.isLoggedIn$.pipe(
      tap(login => {
        if (!login) {
          this.userService.doLogin(state.url);
        }
      })
    );
  }

}
