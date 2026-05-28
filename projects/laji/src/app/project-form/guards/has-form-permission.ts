import { Rights } from '../../shared/service/form-permission.service';
import { AbstractPermissionGuard } from './abstract-permission-guard';
import { Injectable } from '@angular/core';

@Injectable()
export class HasFormPermission extends AbstractPermissionGuard {
  checkPermission(rights: Rights) {
    return rights.edit || rights.admin;
  }

}
