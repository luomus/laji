import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { FormPermissionService } from '../form-permission.service';
import { ToastsService } from '../../../shared/service/toasts.service';
import { UserService } from '../../../shared/service/user.service';
import { FormPermission } from '../../../shared/model/FormPermission';
import { Logger } from '../../../shared/logger/logger.service';
import { Person } from '../../../shared/model/Person';

export enum AccessLevel {
  Allowed,
  Requested,
  NotRequested
}

@Component({
  selector: 'laji-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css']
})
export class RequestComponent implements OnInit {
  // Allow use of AccessLevel Enum in templates
  AccessLevel = AccessLevel;

  accessLevel: AccessLevel = AccessLevel.NotRequested;

  @Input() collectionId: string;
  @Input() disableDescription = false;

  constructor(
    private formPermissionService: FormPermissionService,
    private userService: UserService,
    private toastsService: ToastsService,
    private logger: Logger,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.formPermissionService
      .getFormPermission(this.collectionId, this.userService.getToken())
      .subscribe(formPermission => this.checkAccess(formPermission));
  }

  private checkAccess(formPermission: FormPermission) {
    this.userService
      .getUser()
      .subscribe((person: Person) => {
        if (formPermission.editors.indexOf(person.id) > -1 || formPermission.admins.indexOf(person.id) > -1) {
          this.accessLevel = AccessLevel.Allowed;
        } else if (formPermission.permissionRequests.indexOf(person.id) > -1) {
          this.accessLevel = AccessLevel.Requested;
        }
      });
  }

  makeAccessRequest() {
    this.formPermissionService.makeAccessRequest(this.collectionId, this.userService.getToken())
      .subscribe(
        (formPermission: FormPermission) => {
          this.accessLevel = AccessLevel.Requested;
          this.toastsService.showSuccess('Pyyntösi on lähetetty eteenpäin');
          this.cd.markForCheck();
        },
        (err) => {
          if (err.status !== 406) {
            this.toastsService.showError('Pyyntöäsi lähetys epäonnistui');
            this.logger.error('Failed to send formPermission request', {
              collectionId: this.collectionId
            });
          }
        }
      );
  }
}
