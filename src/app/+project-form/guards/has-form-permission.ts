// import { Injectable } from '@angular/core';
// import { Observable, of } from 'rxjs';
// import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
// import { tap } from 'rxjs/operators';
// import { UserService } from '../../shared/service/user.service';
// import { FormService } from '../../shared/service/form.service';
// import { TranslateService } from '@ngx-translate/core';
// import { FormPermissionService } from '../../shared/service/form-permission.service';
// import { PlatformService } from '../../shared/service/platform.service';

// @Injectable()
// export class HasFormPermission implements CanActivate {

//   constructor(private userService: UserService,
//               private formService: FormService,
//               private formPermissionService: FormPermissionService,
//               private router: Router,
//               private route: ActivatedRoute,
//               private translate: TranslateService,
//               private platformService: PlatformService,
// ) { }

  // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
  //   if (this.platformService.isServer) {
  //     return of(true);
  //   }

    // let formID;
    // do {
    //   if (route.params?.projectID) {
    //     formID = route.params.projectID;
    //     break;
    //   }
    //   route = route.parent;
    // } while (route);

    // if (!formID) {
    //   console.warn('HasFormPermission guard used for non project page');
    //   this.router.navigate(['/', 'project', formID]);
    //   return;
    // }

//     return this.formPermissionService.hasAccessToForm(formID).pipe(
//       tap((hasPermission) => {
//         if (!hasPermission) {
//           this.router.navigate(['/', 'project', formID]);
//         }
//       })
//     );
//   }
// }
import { Rights } from '../../shared/service/form-permission.service';
import { AbstractPermissionGuard } from './abstract-permission-guard';
import { Injectable } from "@angular/core";

@Injectable()
export class HasFormPermission extends AbstractPermissionGuard {
  checkPermission(rights: Rights) {
    return rights.edit || rights.admin;
  }
}
