import { FormPermission } from '../../../shared/model/FormPermission';
import { combineLatest, take } from 'rxjs/operators';
import { FormPermissionService } from '../form-permission.service';
import { UserService } from '../../../shared/service/user.service';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';

export abstract class AbstractPermission {
  formPermission: FormPermission;
  isAllowed = false;
  collectionId: string;

  protected formPermissionService: FormPermissionService;
  protected userService: UserService;
  protected router: Router;
  protected localizeRouterService: LocalizeRouterService;

  protected initFormPermission() {
    if (!this.collectionId) {
      return;
    }
    this.formPermissionService
      .getFormPermission(this.collectionId, this.userService.getToken()).pipe(
      combineLatest(
        this.userService.user$.pipe(take(1)),
        (permission, person) => ({permission, person})
      ))
      .subscribe((data) => {
        this.formPermission = data.permission;
        this.isAllowed = this.formPermissionService.isAdmin(data.permission, data.person) || UserService.isIctAdmin(data.person);
        if (!this.isAllowed) {
          this.router.navigate(
            this.localizeRouterService.translateRoute(['/vihko'])
          );
        }
      });
  }

}
