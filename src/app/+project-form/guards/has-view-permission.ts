import { Rights } from '../../shared/service/form-permission.service';
import { AbstractPermissionGuard } from './abstract-permission-guard';

export class HasViewPermission extends AbstractPermissionGuard {
  checkPermission(rights: Rights) {
    return rights.view || rights.edit || rights.admin;
  }
}
