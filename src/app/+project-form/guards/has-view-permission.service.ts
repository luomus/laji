import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { flatMap, map, take, tap } from 'rxjs/operators';
import { UserService } from '../../shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { FormService } from '../../shared/service/form.service';
import { FormPermissionService } from '../../shared/service/form-permission.service';
import { ProjectFormService } from '../project-form.service';

@Injectable()
export class HasViewPermission implements CanActivate {

  constructor(private userService: UserService,
              private formService: FormService,
              private formPermissionService: FormPermissionService,
              private router: Router,
              private route: ActivatedRoute,
              private translate: TranslateService,
              private projectFormService: ProjectFormService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    let formID;
    do {
      if (route.params?.projectID) {
        formID = route.params.projectID;
        break;
      }
      route = route.parent;
    } while (route);

    if (!formID) {
      console.warn('HasViewPermission guard used for non project page');
      this.router.navigate(['/', 'project', formID]);
      return;
    }

    return this.formService.getForm(formID, this.translate.currentLang).pipe(
      take(1),
      flatMap(form => this.formPermissionService.getRights(form)),
      map(fp => fp.view || fp.edit || fp.admin),
      tap((hasPermission) => {
        if (!hasPermission) {
            this.router.navigate(['/', 'project', formID]);
        }
      })
    );
  }

}
