import { Component, Input, OnInit } from '@angular/core';
import { FormPermissionService } from '../../../shared/service/form-permission.service';
import { ToastsService } from '../../../shared/service/toasts.service';
import { UserService } from '../../../shared/service/user.service';
import { Logger } from '../../../shared/logger/logger.service';
import { map, switchMap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

export enum AccessLevel {
  Allowed,
  Requested,
  NotRequested
}

interface ViewModel {
  loggedIn: boolean;
  accessLevel?: AccessLevel;
}

@Component({
  selector: 'laji-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css']
})
export class RequestComponent implements OnInit {
  // Allow use of AccessLevel Enum in templates
  AccessLevel = AccessLevel;  // eslint-disable-line @typescript-eslint/naming-convention

  vm$!: Observable<ViewModel>;
  private resetVM$ = new BehaviorSubject<void>(undefined);

  @Input() collectionId!: string;
  @Input() disableDescription = false;

  clicked = false;

  constructor(
    private formPermissionService: FormPermissionService,
    private userService: UserService,
    private toastsService: ToastsService,
    private logger: Logger,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.vm$ = combineLatest(this.userService.isLoggedIn$, this.resetVM$).pipe(
      switchMap(([loggedIn]) =>
        !loggedIn
          ? of({loggedIn: false})
          : this.formPermissionService.getFormPermission(this.collectionId, this.userService.getToken())
            .pipe(
              switchMap(formPermission => this.userService.user$.pipe(
                map(person => {
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  if (formPermission.editors.indexOf(person!.id!) > -1 || formPermission.admins.indexOf(person!.id!) > -1) {
                    return {accessLevel: AccessLevel.Allowed, loggedIn: true};
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  } else if (formPermission.permissionRequests.indexOf(person!.id!) > -1) {
                    return {accessLevel: AccessLevel.Requested, loggedIn: true};
                  }
                  return {accessLevel: AccessLevel.NotRequested, loggedIn: true};
                })
              ))
            )
      )
    );
  }

  makeAccessRequest() {
    if (this.clicked) {
      return;
    }
    this.clicked = true;
    this.formPermissionService.makeAccessRequest(this.collectionId, this.userService.getToken())
      .subscribe(
        () => {
          this.resetVM$.next();
          this.toastsService.showSuccess(this.translate.instant('form.permission.request.succes'));
        },
        (err) => {
          if (err.status !== 406) {
            this.toastsService.showError(this.translate.instant('form.permission.request.error'));
            this.logger.error('Failed to send formPermission request', {
              collectionId: this.collectionId
            });
          }
        }
      );
  }
}
