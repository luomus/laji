import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, take } from 'rxjs';
import { UserService } from '../../shared/service/user.service';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { PlatformService } from '../../root/platform.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileRedirectGuard  {

  constructor(
    private userService: UserService,
    private localizeRouterService: LocalizeRouterService,
    private router: Router,
    private platformService: PlatformService
  ) {}

  canActivate(route: ActivatedRouteSnapshot): UrlTree|Observable<boolean> {
    if (!this.platformService.isBrowser) {
      return of(false);
    }
    return this.userService.user$.pipe(
      take(1),
      switchMap(user => user?.id ?
        this.router.navigate(this.localizeRouterService.translateRoute(['/user', user.id])) :
        of(true)
      )
    );
  }
}
