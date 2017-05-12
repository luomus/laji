import { EventEmitter, Injectable } from '@angular/core';
import { FormPermissionApi } from '../../shared/api/FormPermissionApi';
import { Observable } from 'rxjs/Observable';
import { FormPermission } from '../../shared/model/FormPermission';
import { Person } from '../../shared/model/Person';

@Injectable()
export class FormPermissionService {

  private static formPermissions = {};

  public changes$ = new EventEmitter<any>();

  constructor(private formPermissionApi: FormPermissionApi) {}

  isEditAllowed(formPermission: FormPermission, person: Person): boolean {
    if (formPermission.editors.indexOf(person.id) > -1) {
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

  acceptRequest(collectionID: string, personToken: string, personID: string) {
    FormPermissionService.formPermissions[collectionID] = false;
    return this.formPermissionApi.acceptRequest(collectionID, personID, personToken)
      .do(fp => this.changes$.emit(fp));
  }

  revokeAccess(collectionID: string, personToken: string, personID: string) {
    FormPermissionService.formPermissions[collectionID] = false;
    return this.formPermissionApi.revokeAccess(collectionID, personID, personToken)
      .do(fp => this.changes$.emit(fp));
  }

}
