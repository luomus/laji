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
    return this.formService.getForm(route.data.formId, 'fi').pipe(
      take(1),
      flatMap(data => this.formPermissionService.getRights(data)),
      map(data => data.edit || data.admin),
      tap((hasPermission) => {
        const {noFormPermissionRedirect} = route.data;
        if (!hasPermission && noFormPermissionRedirect) {
          this.router.navigate([noFormPermissionRedirect]);
        }
      })
    );
  }

}
