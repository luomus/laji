import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { flatMap, map, take, tap } from 'rxjs/operators';
import { UserService } from '../../shared/service/user.service';
import { FormService } from '../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { FormPermissionService, Rights } from '../../shared/service/form-permission.service';
import { PlatformService } from '../../root/platform.service';
import { LocalizeRouterService } from '../../locale/localize-router.service';

@Injectable()
export abstract class AbstractPermissionGuard  {

  constructor(private userService: UserService,
              private formService: FormService,
              private formPermissionService: FormPermissionService,
              private router: Router,
              private platformService: PlatformService,
              private localizeRouteService: LocalizeRouterService
) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    if (this.platformService.isServer) {
      return of(true);
    }

    let formID;
    do {
      if (route.params?.projectID) {
        formID = route.params.projectID;
        break;
      }
      route = route.parent;
    } while (route);

    if (!formID) {
      console.warn('HasFormPermission guard used for non project page');
      this.router.navigate(this.localizeRouteService.translateRoute(['/', 'project', formID]));
      return EMPTY;
    }

    return this.formService.getForm(formID).pipe(
      take(1),
      tap(form => {
        if (!form) {
          this.router.navigate(['/', 'project', formID]);
        }
      }),
      flatMap(form => this.formPermissionService.getRights(form)),
      map(fp => this.checkPermission(fp)),
      tap((hasPermission) => {
        if (!hasPermission) {
          this.userService.isLoggedIn$.pipe(take(1)).subscribe(isLoggedIn => {
            if (isLoggedIn) {
              return this.router.navigate(this.localizeRouteService.translateRoute(['/', 'project', formID]));
            } else {
              return this.userService.redirectToLogin();
            }
          });
        }
      })
    );
  }

  abstract checkPermission(rights: Rights): boolean;
}
