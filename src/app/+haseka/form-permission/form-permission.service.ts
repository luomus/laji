import { EventEmitter, Injectable } from '@angular/core';
import { FormPermissionApi } from '../../shared/api/FormPermissionApi';
import { Observable, of, of as ObservableOf } from 'rxjs';
import { FormPermission } from '../../shared/model/FormPermission';
import { Person } from '../../shared/model/Person';
import { Form } from '../../shared/model/Form';
import { UserService } from '../../shared/service/user.service';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { FormService } from '../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { PlatformService } from '../../shared/service/platform.service';

export interface Rights {
  edit: boolean;
  admin: boolean;
}

@Injectable({providedIn: 'root'})
export class FormPermissionService {

  private static formPermissions = {};

  public changes$ = new EventEmitter<any>();

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
      switchMap(form => !form.collectionID || !form.features || form.features.indexOf(Form.Feature.Restricted) === -1 ?
        of(true) :
        permission$(form.collectionID)
      )
    );
  }


  isPending(formPermission: FormPermission, person: Person): boolean {
    return formPermission.permissionRequests && formPermission.permissionRequests.indexOf(person.id) > -1;
  }

  isEditAllowed(formPermission: FormPermission, person: Person, features?: Form.Feature[]): boolean {
    if (features && features.indexOf(Form.Feature.Restricted) === -1) {
      return true;
    }
    if ((formPermission.editors && formPermission.editors.indexOf(person.id) > -1) ||
        (formPermission.admins && formPermission.admins.indexOf(person.id) > -1)) {
      return true;
    }
    return false;
  }

  isAdmin(permission: FormPermission, person: Person) {
    if (permission.admins && permission.admins.indexOf(person.id) > -1) {
      return true;
    }
    return false;
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
    return this.access(
      form,
      {edit: false, admin: false},
      {edit: true, admin: false},
      (formPermission: FormPermission, person: Person) => ({
        edit: this.isEditAllowed(formPermission, person, form.features || []),
        admin: this.isAdmin(formPermission, person)
      }));
  }

  private access(form: any, notLoggedIn: any, notRestricted: any, cb: (formPermission: FormPermission, person: Person) => any) {
    return this.userService.isLoggedIn$.pipe(
      take(1),
      switchMap(login => {
        if (!login || this.platformService.isServer) {
          return ObservableOf(notLoggedIn);
        } else if (!form.collectionID || !form.features || (
          form.features.indexOf(Form.Feature.Restricted) === -1 &&
          form.features.indexOf(Form.Feature.Administer) === -1
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
