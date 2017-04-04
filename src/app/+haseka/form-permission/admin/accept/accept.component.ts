import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { FormPermissionService } from '../../form-permission.service';
import { ToastsService } from '../../../../shared/service/toasts.service';
import { FormPermission } from '../../../../shared/model/FormPermission';
import { UserService } from '../../../../shared/service/user.service';
import { Logger } from '../../../../shared/logger/logger.service';
import { Person } from '../../../../shared/model/Person';

@Component({
  selector: 'laji-accept',
  templateUrl: './accept.component.html',
  styleUrls: ['./accept.component.css']
})
export class AcceptComponent implements OnInit, OnDestroy {

  formPermission: FormPermission;
  isAllowed = false;
  collectionId: string;

  private subParam: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formPermissionService: FormPermissionService,
    private toastsService: ToastsService,
    private userService: UserService,
    private logger: Logger
  ) { }

  ngOnInit() {
    this.subParam = this.route.parent.params.subscribe(params => {
      this.collectionId = params['collectionId'];
      this.initFormPermission();
    });
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
  }

  accept(personId: string) {
    this.formPermissionService.acceptRequest(this.collectionId, this.userService.getToken(), personId)
      .subscribe(
        () => this.initFormPermission()
      );
  }

  reject(personId: string) {
    this.formPermissionService.revokeAccess(this.collectionId, this.userService.getToken(), personId)
      .subscribe(
        () => this.initFormPermission()
      );
  }
  
  private initFormPermission() {
    if (!this.collectionId) {
      return;
    }
    this.formPermissionService
      .getFormPermission(this.collectionId, this.userService.getToken())
      .do(data => this.formPermission = data)
      .switchMap(() => this.userService.getUser())
      .subscribe((person: Person) => {
        this.isAllowed = person.role.indexOf('MA.admin') > -1;
        if (!this.isAllowed) {
          this.router.navigate(['/vihko']);
        }
      });
  }

}
