import { Rights } from '../../shared/service/form-permission.service';
import { AbstractPermissionGuard } from './abstract-permission-guard';

export class HasAdminPermission extends AbstractPermissionGuard {
  checkPermission(rights: Rights) {
    return rights.admin;
  }
}
