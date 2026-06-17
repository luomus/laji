import { Rights } from '../../shared/service/form-permission.service';
import { AbstractPermissionGuard } from './abstract-permission-guard';
import { Injectable } from '@angular/core';

@Injectable()
export class HasAdminPermission extends AbstractPermissionGuard {
  checkPermission(rights: Rights) {
    return rights.admin || rights.ictAdmin;
  }
}
