import { EventEmitter, Injectable } from '@angular/core';
import { FormPermissionApi } from '../../shared/api/FormPermissionApi';
import { Observable, of as ObservableOf } from 'rxjs';
import { FormPermission } from '../../shared/model/FormPermission';
import { Person } from '../../shared/model/Person';
import { Form } from '../../shared/model/Form';
import { UserService } from '../../shared/service/user.service';
import { catchError, map, switchMap, take } from 'rxjs/operators';

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
    private userSerivce: UserService
  ) {}


  isPending(formPermission: FormPermission, person: Person): boolean {
    return formPermission.permissionRequests && formPermission.permissionRequests.indexOf(person.id) > -1;
  }

  isEditAllowed(formPermission: FormPermission, person: Person): boolean {
    if ((formPermission.editors && formPermission.editors.indexOf(person.id) > -1) ||
        (formPermission.admins && formPermission.admins.indexOf(person.id) > -1)) {
      return true;
    }
    return false;
  }

  isAdmin(permission: FormPermission, person: Person) {
    if (person.role && person.role.indexOf('MA.admin') > -1) {
      return true;
    } else if (permission.admins && permission.admins.indexOf(person.id) > -1) {
      return true;
    }
    return false;
  }

  getFormPermission(collectionID: string, personToken?: string): Observable<FormPermission> {
    if (FormPermissionService.formPermissions[collectionID]) {
      return ObservableOf(FormPermissionService.formPermissions[collectionID]);
    }
    return this.formPermissionApi
      .findByCollectionID(collectionID, personToken)
      .do(data => FormPermissionService.formPermissions[data.collectionID] = data);
  }

  makeAccessRequest(collectionID: string, personToken: string) {
    FormPermissionService.formPermissions[collectionID] = false;
    return this.formPermissionApi
      .requestAccess(collectionID, personToken)
      .do(fp => this.changes$.emit(fp));
  }

  acceptRequest(collectionID: string, personToken: string, personID: string, type?: FormPermission.Type) {
    FormPermissionService.formPermissions[collectionID] = false;
    return this.formPermissionApi.acceptRequest(collectionID, personID, personToken, type)
      .do(fp => this.changes$.emit(fp));
  }

  revokeAccess(collectionID: string, personToken: string, personID: string) {
    FormPermissionService.formPermissions[collectionID] = false;
    return this.formPermissionApi.revokeAccess(collectionID, personID, personToken)
      .do(fp => this.changes$.emit(fp));
  }

  hasEditAccess(form: Form.List): Observable<boolean> {
    return this.access(
      form,
      false,
      true,
      (formPermission: FormPermission, person: Person) => this.isEditAllowed(formPermission, person));
  }

  hasPendingAccess(form: Form.List): Observable<boolean> {
    return this.access(
      form,
      false,
      false,
      (formPermission: FormPermission, person: Person) => this.isPending(formPermission, person));
  }

  getRights(form: Form.List): Observable<Rights> {
    return this.access(
      form,
      {edit: false, admin: false},
      {edit: true, admin: false},
      (formPermission: FormPermission, person: Person) => ({
        edit: this.isEditAllowed(formPermission, person),
        admin: this.isAdmin(formPermission, person)
      }));
  }

  private access(form: any, notLoggedIn: any, notRestricted: any, cb: (formPermission: FormPermission, person: Person) => any) {
    return this.userSerivce.isLoggedIn$.pipe(
      take(1),
      switchMap(login => {
        if (!login) {
          return ObservableOf(notLoggedIn);
        } else if (!form.collectionID || !form.features || form.features.indexOf(Form.Feature.Restricted) === -1) {
          return ObservableOf(notRestricted);
        }
        return this.userSerivce.getUser().pipe(
          switchMap((person: Person) => this.getFormPermission(form.collectionID, this.userSerivce.getToken()).pipe(
            map((formPermission: FormPermission) => ({person, formPermission}))
          )),
          switchMap(data => ObservableOf(cb(data.formPermission, data.person))),
          catchError(() => ObservableOf(notLoggedIn))
        );
      })
    );
  }
}
