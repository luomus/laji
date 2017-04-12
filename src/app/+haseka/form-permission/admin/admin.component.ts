import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { FormPermissionService } from '../form-permission.service';
import { ToastsService } from '../../../shared/service/toasts.service';
import { UserService } from '../../../shared/service/user.service';
import { FormPermission } from '../../../shared/model/FormPermission';
import { Logger } from '../../../shared/logger/logger.service';
import { Person } from '../../../shared/model/Person';

@Component({
  selector: '[laji-form-admin]',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {

  formPermission: FormPermission;
  isAllowed = false;
  collectionId: string;

  private subParam: Subscription;
  private subFPChanges: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formPermissionService: FormPermissionService,
    private toastsService: ToastsService,
    private userService: UserService,
    private logger: Logger
  ) { }

  ngOnInit() {
    this.subParam = this.route.params.subscribe(params => {
      this.collectionId = params['collectionId'];
      this.initFormPermission();
    });
    this.subFPChanges = this.formPermissionService.changes$
      .subscribe(fp => this.formPermission = fp);
  }

  ngOnDestroy() {
    this.subParam.unsubscribe();
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
