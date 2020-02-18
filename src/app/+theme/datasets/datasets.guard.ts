import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { switchMap, take } from 'rxjs/operators';
import { UserService } from '../../shared/service/user.service';
import { PlatformService } from '../../shared/service/platform.service';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { FormPermissionService } from '../../+haseka/form-permission/form-permission.service';
import { ThemeFormService } from '../common/theme-form.service';

@Injectable({providedIn: 'root'})
export class DatasetsGuard implements CanActivate {

  constructor(
    private router: Router,
    private userService: UserService,
    private platformService: PlatformService,
    private localizeRouterService: LocalizeRouterService,
    private formPermissionService: FormPermissionService,
    private themeFormService: ThemeFormService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean|UrlTree> | boolean {
    if (this.platformService.isServer) {
      return true;
    }
    const returnToStart = of(this.router.createUrlTree(
      this.localizeRouterService.translateRoute(['/theme/datasets'])
    ));

    return this.userService.isLoggedIn$.pipe(
      take(1),
      switchMap(isLoggedIn => {
        if (!isLoggedIn) {
          return returnToStart;
        }
        return this.themeFormService.getForm(route).pipe(
          switchMap(form => this.formPermissionService.hasAccessToForm(form.id)),
          switchMap(access => access ? of(true) : returnToStart)
        );
      })
    );
  }
}
