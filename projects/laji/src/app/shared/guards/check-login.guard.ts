import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { UserService } from '../service/user.service';
import { Observable, of } from 'rxjs';
import { Location } from '@angular/common';
import { PlatformService } from '../service/platform.service';
import { PERSON_TOKEN } from '../service/laji-api-worker-common';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PersonApi } from '../api/PersonApi';

@Injectable({
  providedIn: 'root'
})
export class CheckLoginGuard implements CanActivate {

  private isChecked = false;

  constructor(
    private personApi: PersonApi,
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
      this.isChecked = true;
      this.location.replaceState(this.location.path().split('?')[0], '');
      if (this.platformService.canUseWebWorkerLogin) {
        this.personApi.personFindByToken(PERSON_TOKEN).pipe(
          map(() => PERSON_TOKEN),
          catchError(e => {
            if (e.status === 0) {
              this.platformService.canUseWebWorkerLogin = false;

              return of(route.queryParams['token']);
            }
            return of(PERSON_TOKEN);
          }),
          switchMap(token => this.userService.login(token))
        ).subscribe();
      } else {
        this.userService.login(route.queryParams['token']).subscribe();
      }

      return this.router.parseUrl(this.userService.getReturnUrl());
    }

    if (this.isChecked) {
      return true;
    }

    return this.userService.checkLogin();
  }
}
