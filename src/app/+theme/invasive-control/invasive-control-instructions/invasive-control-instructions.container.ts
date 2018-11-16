import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserService } from 'app/shared/service/user.service';
import { FormService } from 'app/shared/service/form.service';
import { environment } from 'environments/environment';
import { catchError } from 'rxjs/operators';
import { FormPermissionService } from 'app/+haseka/form-permission/form-permission.service';
import { TranslateService } from '@ngx-translate/core';

export enum Rights {
  Allowed,
  NotAllowed,
  NotDefined
}

@Component({
  template: `<laji-invasive-control-instructions
    [loggedIn]="loggedIn | async"
    [rights]="rights">
  </laji-invasive-control-instructions>`
})
export class InvasiveControlInstructionsContainerComponent
      implements OnInit {
  loggedIn: Observable<boolean>;
  rights: Rights;

  constructor(private userService: UserService,
              private formService: FormService,
              private formPermissionService: FormPermissionService,
              private cd: ChangeDetectorRef,
              private translateService: TranslateService) {}

  ngOnInit() {
    this.loggedIn = this.userService.isLoggedIn$.take(1);

    this.formService.getForm(environment.invasiveControlForm, this.translateService.currentLang)
    .switchMap(form => this.formPermissionService.getRights(form))
    .pipe(
      catchError(() => {
        this.rights = Rights.NotDefined;
        return of({edit: false, admin: false})
      })
    )
    .subscribe((rights) => {
      if (rights.edit === true) {
        this.rights = Rights.Allowed;
      } else {
        this.rights = Rights.NotAllowed
      }
      this.cd.markForCheck();
    })
  }
}
