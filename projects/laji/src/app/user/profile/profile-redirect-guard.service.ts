import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { map, Observable, of } from 'rxjs';
import { take } from 'rxjs';
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

  canActivate(): Observable<boolean | UrlTree> {
  if (!this.platformService.isBrowser) {
    return of(false);
  }

  return this.userService.user$.pipe(
    take(1),
    map(user =>
      user?.id
        ? this.router.createUrlTree(
            this.localizeRouterService.translateRoute(['/user', user.id])
          )
        : true
    )
  );
}
}
