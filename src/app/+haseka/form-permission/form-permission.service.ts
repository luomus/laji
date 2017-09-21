import { EventEmitter, Injectable } from '@angular/core';
import { FormPermissionApi } from '../../shared/api/FormPermissionApi';
import { Observable } from 'rxjs/Observable';
import { FormPermission } from '../../shared/model/FormPermission';
import { Person } from '../../shared/model/Person';
import { Form } from '../../shared/model/Form';
import { UserService } from '../../shared/service/user.service';

@Injectable()
export class FormPermissionService {

  private static formPermissions = {};

  public changes$ = new EventEmitter<any>();

  constructor(
    private formPermissionApi: FormPermissionApi,
    private userSerivce: UserService
  ) {}

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
      return Observable.of(FormPermissionService.formPermissions[collectionID]);
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
    if (!form.collectionID || !form.features || form.features.indexOf(Form.Feature.Restricted) === -1) {
      return Observable.of(true);
    }
    return this.userSerivce.getUser()
      .switchMap(
        (person: Person) => this.getFormPermission(form.collectionID, this.userSerivce.getToken()),
        (person: Person, formPermission: FormPermission) => ({person, formPermission})
      )
      .switchMap(data => Observable.of(this.isEditAllowed(data.formPermission, data.person)));
  }

}
