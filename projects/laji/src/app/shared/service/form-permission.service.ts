import { EventEmitter, Injectable } from '@angular/core';
import { FormPermissionApi } from '../api/FormPermissionApi';
import { Observable, of, of as ObservableOf } from 'rxjs';
import { FormPermission } from '../model/FormPermission';
import { Person } from '../model/Person';
import { Form } from '../model/Form';
import { UserService } from './user.service';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { FormService } from './form.service';
import { TranslateService } from '@ngx-translate/core';
import { PlatformService } from '../../shared-modules/platform/platform.service';
import RestrictAccess = Form.RestrictAccess;

export interface Rights {
  edit: boolean;
  admin: boolean;
  view: boolean;
  ictAdmin: boolean;
}

@Injectable({providedIn: 'root'})
export class FormPermissionService {

  private static formPermissions = {};

  public changes$ = new EventEmitter<FormPermission>();

  constructor(
    private formPermissionApi: FormPermissionApi,
    private formService: FormService,
    private userService: UserService,
    private translateService: TranslateService,
    private platformService: PlatformService
  ) {}

  hasAccessToForm(formID: string, personToken?: string): Observable<boolean> {
    const token = personToken || this.userService.getToken();
    if (!formID || !token) {
      return of(false);
    }

    const permission$ = (collectionID) => this.formPermissionApi.findPermissions(token).pipe(
      switchMap(permission => of(permission.admins.includes(collectionID) || permission.editors.includes(collectionID)))
    );

    return this.formService.getAllForms(this.translateService.currentLang).pipe(
      map(forms => forms.find(f => f.id === formID)),
      switchMap(form => (!form.collectionID || !form.options?.restrictAccess)
        ? of(true)
        : permission$(form.collectionID)
      )
    );
  }

  isEditAllowed(formPermission: FormPermission, person: Person, form: Form.List): boolean {
    return !form.options?.restrictAccess
      || formPermission.editors?.indexOf(person.id) > -1
      || formPermission.admins?.indexOf(person.id) > -1;
  }

  isAdmin(permission: FormPermission, person: Person): boolean {
    return permission.admins?.indexOf(person.id) > -1;
  }

  getFormPermission(collectionID: string, personToken?: string): Observable<FormPermission> {
    if (FormPermissionService.formPermissions[collectionID]) {
      return ObservableOf(FormPermissionService.formPermissions[collectionID]);
    }
    return this.formPermissionApi
      .findByCollectionID(collectionID, personToken).pipe(
      tap(data => FormPermissionService.formPermissions[data.collectionID] = data));
  }

  makeAccessRequest(collectionID: string, personToken: string) {
    FormPermissionService.formPermissions[collectionID] = false;
    return this.formPermissionApi
      .requestAccess(collectionID, personToken).pipe(
      tap(fp => this.changes$.emit(fp)));
  }

  acceptRequest(collectionID: string, personToken: string, personID: string, type?: FormPermission.Type) {
    FormPermissionService.formPermissions[collectionID] = false;
    return this.formPermissionApi.acceptRequest(collectionID, personID, personToken, type).pipe(
      tap(fp => this.changes$.emit(fp)));
  }

  revokeAccess(collectionID: string, personToken: string, personID: string) {
    FormPermissionService.formPermissions[collectionID] = false;
    return this.formPermissionApi.revokeAccess(collectionID, personID, personToken).pipe(
      tap(fp => this.changes$.emit(fp)));
  }

  getRights(form: Form.List): Observable<Rights> {
    const notLoggedIn = {
      edit: false,
      admin: false,
      ictAdmin: false,
      view: form.options?.restrictAccess !== RestrictAccess.restrictAccessStrict
    };
    if (!form.collectionID) {
      return this.userService.user$.pipe(map(user => ({
        edit: true,
        view: true,
        admin: false,
        ictAdmin: UserService.isIctAdmin(user)
      })));
    }
    return this.userService.isLoggedIn$.pipe(
      take(1),
      switchMap(login => {
        if (!login || this.platformService.isServer) {
          return ObservableOf(notLoggedIn);
        }
        return this.userService.user$.pipe(
          take(1),
          switchMap((person: Person) =>
              this.getFormPermission(form.collectionID, this.userService.getToken()).pipe(
              catchError(() => of({
                id: '',
                collectionID: form.collectionID,
                admins: [],
                editors: []
              } as FormPermission)),
              map((formPermission: FormPermission) => ({person, formPermission}))
              )),
          switchMap(({person, formPermission}) => ObservableOf({
            view: this.isEditAllowed(formPermission, person, form) || form.options?.restrictAccess === RestrictAccess.restrictAccessLoose,
            edit: this.isEditAllowed(formPermission, person, form),
            admin: this.isAdmin(formPermission, person),
            ictAdmin: UserService.isIctAdmin(person)
          })),
          catchError(() => ObservableOf(notLoggedIn))
        );
      })
    );
  }
}
