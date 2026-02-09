import { FormPermission } from '../../../shared/model/FormPermission';
import { combineLatest, map, take, tap } from 'rxjs';
import { FormPermissionService } from '../../../shared/service/form-permission.service';
import { isIctAdmin, UserService } from '../../../shared/service/user.service';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { Observable, of } from 'rxjs';
import { Person } from '../../../shared/model/Person';

export abstract class AbstractPermission {
  formPermission!: FormPermission;
  isAllowed = false;
  collectionId!: string;

  protected formPermissionService!: FormPermissionService;
  protected userService!: UserService;
  protected router!: Router;
  protected localizeRouterService!: LocalizeRouterService;

  protected updateFormPermission$(): Observable<any> {
    if (!this.collectionId) {
      return of(null);
    }

    return combineLatest([
      this.formPermissionService.getFormPermission(
        this.collectionId,
        this.userService.getToken()
      ),
      this.userService.user$.pipe(take(1))
    ]).pipe(
      map(([permission, person]) => ({ permission, person })),
      tap(data => {
        this.formPermission = data.permission;
        this.isAllowed = this.formPermissionService.isAdmin(data.permission, data.person as Person) || isIctAdmin(data.person);

        if (!this.isAllowed) {
          this.router.navigate(
            this.localizeRouterService.translateRoute(['/vihko'])
          );
        }
      })
    );
  }
}
