import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { UserService } from '../../shared/service/user.service';
import { LocalizeRouterService } from '../../locale/localize-router.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileRedirectGuard implements CanActivate {

  constructor(
    private userService: UserService,
    private localizeRouterService: LocalizeRouterService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): UrlTree|boolean|Observable<boolean> {
    return this.userService.user$.pipe(
      take(1),
      switchMap(user => user?.id ?
        this.router.navigate(this.localizeRouterService.translateRoute(['/user', user.id])) :
        of(true)
      )
    );
  }
}
