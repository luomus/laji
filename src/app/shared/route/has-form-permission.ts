import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../service/user.service';
import { flatMap, map, take, tap } from 'rxjs/operators';
import { FormPermissionService } from '../../+haseka/form-permission/form-permission.service';
import { FormService } from '../service/form.service';

@Injectable({providedIn: 'root'})
export class HasFormPermission implements CanActivate {

  constructor(private userService: UserService,
              private formService: FormService,
              private formPermissionService: FormPermissionService,
              private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    let {data} = route;
    // Find data route, which can be in the given route or in some of its parents.
    do {
      if (route.data && route.data.formID) {
        data = route.data;
        break;
      }
      route = route.parent;
    } while (route);

    if (!data.formID) {
      console.warn('HasFormPermission guard used without route data with formID');
    }

    return this.formService.getForm(data.formID, 'fi').pipe(
      take(1),
      flatMap(form => this.formPermissionService.getRights(form)),
      map(fp => fp.edit || fp.admin),
      tap((hasPermission) => {
        const {noFormPermissionRedirect} = data;
        if (!hasPermission) {
          this.router.navigate([noFormPermissionRedirect || '/']);
        }
      })
    );
  }

}
