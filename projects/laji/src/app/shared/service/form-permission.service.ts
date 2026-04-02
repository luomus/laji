import { EventEmitter, Injectable } from '@angular/core';
import { Observable, of, of as ObservableOf, throwError } from 'rxjs';
import { Person } from '../model/Person';
import { isIctAdmin, UserService } from './user.service';
import { catchError, map, switchMap, take, tap } from 'rxjs';
import { FormService } from './form.service';
import { PlatformService } from '../../root/platform.service';
import { HttpErrorResponse } from '@angular/common/http';
import { components } from 'projects/laji-api-client-b/generated/api.d';
import { LajiApiClientBService } from 'projects/laji-api-client-b/src/laji-api-client-b.service';

type FormListing = components['schemas']['FormListing'];
type FormPermission = components['schemas']['FormPermissionDto'];

export type Type = 'admin' | 'editor' | undefined;
export enum TypeEnum {
  Admin = <any> 'admin',
  Editor = <any> 'editor'
}
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
    private api: LajiApiClientBService,
    private formService: FormService,
    private userService: UserService,
    private platformService: PlatformService
  ) {}

  hasAccessToForm(formID: string): Observable<boolean> {
    if (!formID) {
      return of(false);
    }

    const permission$ = (collectionID: string) => this.api.get('/form-permissions').pipe(
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

  isEditAllowed(formPermission: FormPermission, person: Person, form: FormListing): boolean {
    return !!person.id && (
      !form.options?.restrictAccess
        || (!!formPermission.editors && formPermission.editors.indexOf(person.id) > -1)
        || (!!formPermission.admins && formPermission.admins.indexOf(person.id) > -1)
    );
  }

  isAdmin(permission: FormPermission, person: Person): boolean {
    return !!person.id && !!permission.admins && permission.admins.indexOf(person.id) > -1;
  }

  getFormPermission(collectionID: string): Observable<FormPermission> {
    const cached = FormPermissionService.formPermissions[collectionID];
    if (cached) {
      return ObservableOf(cached);
    }
    return this.api.get(
      '/form-permissions/{collectionID}',
      { path: { collectionID }}
    ).pipe(
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

  makeAccessRequest(collectionID: string) {
    FormPermissionService.formPermissions[collectionID] = undefined;
    return this.api.post(
      '/form-permissions/{collectionID}',
      { path: { collectionID }}
    ).pipe(
      tap(fp => this.changes$.emit(fp)));
  }

  acceptRequest(collectionID: string, personID: string, type?: TypeEnum) {
    FormPermissionService.formPermissions[collectionID] = undefined;

    return this.api.put(
      '/form-permissions/{collectionID}/{personID}',
      { query: { type: type as unknown as Type }, path: { collectionID, personID }}
    ).pipe(
      tap(fp => this.changes$.emit(fp)));
  }

  revokeAccess(collectionID: string, personID: string) {
    FormPermissionService.formPermissions[collectionID] = undefined;

    return this.api.delete(
      '/form-permissions/{collectionID}/{personID}',
      { path: { collectionID, personID }}
    ).pipe(
      tap(fp => this.changes$.emit(fp)));
  }

  getRights(form: FormListing): Observable<Rights> {
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
        view: permissions.restrictAccess !== 'MHL.restrictAccessStrict'
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
          switchMap(person => this.getFormPermission(collectionID).pipe(
            catchError(() => of({
              collectionID,
              admins: [],
              editors: []
            } as unknown as FormPermission)),
            map((formPermission: FormPermission) => ({person, formPermission}))
          )),
          switchMap(({person, formPermission}) => person ? of({
            view: this.isEditAllowed(formPermission, person, form) || form.options?.restrictAccess === 'MHL.restrictAccessLoose',
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
