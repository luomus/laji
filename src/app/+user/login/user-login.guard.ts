import { Injectable } from '@angular/core';
import { CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree } from '@angular/router';
import { UserService } from '../../shared/service/user.service';
import { Location } from '@angular/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class UserLoginGuard implements CanActivate {

  constructor(
    private router: Router,
    private userService: UserService,
    private location: Location
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    if (!route.queryParams['token']) {
      return of(this.router.parseUrl('/error/404'));
    }
    this.location.replaceState('/', '');

    return this.userService.login(route.queryParams['token']).pipe(
      map(() => this.router.parseUrl(this.userService.getReturnUrl()))
    );
  }
}
