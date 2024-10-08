import { EventEmitter, Injectable } from '@angular/core';
import { FormPermissionApi } from '../api/FormPermissionApi';
import { Observable, of, of as ObservableOf, throwError } from 'rxjs';
import { FormPermission } from '../model/FormPermission';
import { Person } from '../model/Person';
import { Form } from '../model/Form';
import { isIctAdmin, UserService } from './user.service';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { FormService } from './form.service';
import { PlatformService } from '../../root/platform.service';
import RestrictAccess = Form.RestrictAccess;
import { HttpErrorResponse } from '@angular/common/http';

export interface Rights {
  edit: boolean;
  admin: boolean;
  view: boolean;
  ictAdmin: boolean;
}

@Injectable({providedIn: 'root'})
export class FormPermissionService {

  private static formPermissions: Record<string, FormPermission | undefined> = {};

  public changes$ = new EventEmitter<FormPermission>();

  constructor(
    private formPermissionApi: FormPermissionApi,
    private formService: FormService,
    private userService: UserService,
    private platformService: PlatformService
  ) {}

  hasAccessToForm(formID: string, personToken?: string): Observable<boolean> {
    const token = personToken || this.userService.getToken();
    if (!formID || !token) {
      return of(false);
    }

    const permission$ = (collectionID: string) => this.formPermissionApi.findPermissions(token).pipe(
      switchMap(permission => of(permission.admins.includes(collectionID) || permission.editors.includes(collectionID)))
    );

    return this.formService.getAllForms().pipe(
      map(forms => forms.find(f => f.id === formID)),
      switchMap(form => (!form || !form.collectionID || !form.options?.restrictAccess)
        ? of(true)
        : permission$(form.collectionID)
      )
    );
  }

  isEditAllowed(formPermission: FormPermission, person: Person, form: Form.List): boolean {
    return !!person.id && (
      !form.options?.restrictAccess
        || (!!formPermission.editors && formPermission.editors.indexOf(person.id) > -1)
        || (!!formPermission.admins && formPermission.admins.indexOf(person.id) > -1)
    );
  }

  isAdmin(permission: FormPermission, person: Person): boolean {
    return !!person.id && !!permission.admins && permission.admins.indexOf(person.id) > -1;
  }

  getFormPermission(collectionID: string, personToken?: string): Observable<FormPermission> {
    const cached = FormPermissionService.formPermissions[collectionID];
    if (cached) {
      return ObservableOf(cached);
    }
    return this.formPermissionApi.findByCollectionID(collectionID, personToken).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          return of({ collectionID, admins: [], editors: [], permissionRequests: [] });
        }
        return throwError(err);
      }),
      tap(data => {
        if (data.collectionID) {
          FormPermissionService.formPermissions[data.collectionID] = data;
        }
      }));
  }

  makeAccessRequest(collectionID: string, personToken: string) {
    FormPermissionService.formPermissions[collectionID] = undefined;
    return this.formPermissionApi
      .requestAccess(collectionID, personToken).pipe(
      tap(fp => this.changes$.emit(fp)));
  }

  acceptRequest(collectionID: string, personToken: string, personID: string, type?: FormPermission.Type) {
    FormPermissionService.formPermissions[collectionID] = undefined;
    return this.formPermissionApi.acceptRequest(collectionID, personID, personToken, type).pipe(
      tap(fp => this.changes$.emit(fp)));
  }

  revokeAccess(collectionID: string, personToken: string, personID: string) {
    FormPermissionService.formPermissions[collectionID] = undefined;
    return this.formPermissionApi.revokeAccess(collectionID, personID, personToken).pipe(
      tap(fp => this.changes$.emit(fp)));
  }

  getRights(form: Form.List): Observable<Rights> {
    const {collectionID} = form;

    if (!collectionID) {
      return this.userService.user$.pipe(switchMap(user => user ? of({
        edit: true,
        view: true,
        admin: false,
        ictAdmin: isIctAdmin(user)
      }) : of({ edit: false, admin: false, ictAdmin: false, view: true })));
    }

    const notLoggedInRights$ = this.getFormPermission(collectionID).pipe(
      map(permissions => ({
        edit: false,
        admin: false,
        ictAdmin: false,
        view: permissions.restrictAccess !== RestrictAccess.restrictAccessStrict
      }))
    );

    return this.userService.isLoggedIn$.pipe(
      take(1),
      switchMap(loggedIn => {
        if (!loggedIn || this.platformService.isServer) {
          return notLoggedInRights$;
        }
        return this.userService.user$.pipe(
          take(1),
          switchMap(person =>
              this.getFormPermission(collectionID, this.userService.getToken()).pipe(
              catchError(() => of({
                collectionID,
                admins: [],
                editors: []
              } as FormPermission)),
              map((formPermission: FormPermission) => ({person, formPermission}))
              )),
          switchMap(({person, formPermission}) => person ? of({
            view: this.isEditAllowed(formPermission, person, form) || form.options?.restrictAccess === RestrictAccess.restrictAccessLoose,
            edit: this.isEditAllowed(formPermission, person, form),
            admin: this.isAdmin(formPermission, person),
            ictAdmin: isIctAdmin(person)
          }) : notLoggedInRights$),
          catchError(() => notLoggedInRights$)
        );
      })
    );
  }
}
