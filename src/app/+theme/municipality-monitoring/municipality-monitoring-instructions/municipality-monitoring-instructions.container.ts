import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserService } from 'app/shared/service/user.service';
import { FormService } from 'app/shared/service/form.service';
import { environment } from 'environments/environment';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { FormPermissionService } from 'app/+haseka/form-permission/form-permission.service';
import { TranslateService } from '@ngx-translate/core';

export enum Rights {
  Allowed,
  NotAllowed,
  NotDefined
}

@Component({
  template: `<laji-municipality-monitoring-instructions
    [loggedIn]="loggedIn$ | async"
    [rights]="rights$ | async">
  </laji-municipality-monitoring-instructions>`
})
export class MunicipalityMonitoringInstructionsContainerComponent
      implements OnInit {
  loggedIn$: Observable<boolean>;
  rights$: Observable<Rights>;

  constructor(private userService: UserService,
              private formService: FormService,
              private formPermissionService: FormPermissionService,
              private translateService: TranslateService) {}

  ngOnInit() {
    this.loggedIn$ = this.userService.isLoggedIn$.pipe(take(1));

    this.rights$ = this.formService
    .getForm(environment.municipalityMonitoringForm,
             this.translateService.currentLang)
    .pipe(
      switchMap(form => this.formPermissionService.getRights(form)),
      catchError(() => of({edit: false, admin: false})),
      map((rights) => {
        if (rights.edit === true) {
          return Rights.Allowed;
        } else {
          return Rights.NotAllowed;
        }
      })
    );
  }
}
