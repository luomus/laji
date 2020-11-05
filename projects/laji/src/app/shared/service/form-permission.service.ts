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
import { PlatformService } from './platform.service';
import RestrictAccess = Form.RestrictAccess;

export interface Rights {
  edit: boolean;
  admin: boolean;
  view?: boolean;
  ictAdmin?: boolean;
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
      switchMap(forms => this.formService.getForm(forms.find(f => f.id === formID).id, this.translateService.currentLang)),
      switchMap(form => (!form.collectionID || !form.options?.restrictAccess)
        ? of(true)
        : permission$(form.collectionID)
      )
    );
  }

  isEditAllowed(formPermission: FormPermission, person: Person, form: Form.SchemaForm): boolean {
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

  getRights(form: Form.SchemaForm): Observable<Rights> {
    return this.access(
      form,
      {edit: false, admin: false, view: form.options?.restrictAccess !== RestrictAccess.restrictAccessStrict},
      {edit: true, admin: false, view: true},
      (formPermission: FormPermission, person: Person) => ({
        view: this.isEditAllowed(formPermission, person, form) || form.options?.restrictAccess === RestrictAccess.restrictAccessLoose,
        edit: this.isEditAllowed(formPermission, person, form),
        admin: this.isAdmin(formPermission, person),
        ictAdmin: UserService.isIctAdmin(person)
      }));
  }

  private access(form: Form.SchemaForm, notLoggedIn: any, notRestricted: any, cb: (formPermission: FormPermission, person: Person) => any) {
    return this.userService.isLoggedIn$.pipe(
      take(1),
      switchMap(login => {
        if (!login || this.platformService.isServer) {
          return ObservableOf(notLoggedIn);
        } else if (!form.collectionID || (
          !form.options?.restrictAccess &&
          !form.options?.hasAdmins
        )) {
          return ObservableOf(notRestricted);
        }
        return this.userService.user$.pipe(
          take(1),
          switchMap((person: Person) => this.getFormPermission(form.collectionID, this.userService.getToken()).pipe(
            catchError(() => of({
              id: '',
              collectionID: form.collectionID,
              admins: [],
              editors: []
            } as FormPermission)),
            map((formPermission: FormPermission) => ({person, formPermission}))
          )),
          switchMap(data => ObservableOf(cb(data.formPermission, data.person))),
          catchError(() => ObservableOf(notLoggedIn))
        );
      })
    );
  }
}
