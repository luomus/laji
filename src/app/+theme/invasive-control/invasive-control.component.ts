/* tslint:disable:component-selector */
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FormPermissionService, Rights } from '../../+haseka/form-permission/form-permission.service';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FormService } from '../../shared/service/form.service';
import { UserService } from '../../shared/service/user.service';

@Component({
  selector: '[laji-invasive-control]',
  templateUrl: './invasive-control.component.html',
  styleUrls: ['./invasive-control.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvasiveControlComponent implements OnInit {
  rights: Observable<Rights>;

  constructor(
    private formService: FormService,
    private formPermissionService: FormPermissionService,
    private translateService: TranslateService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.rights = this.formService.getForm(environment.invasiveControlForm, this.translateService.currentLang)
      .switchMap(form => this.formPermissionService.getRights(form))
      .catch(() => ObservableOf({edit: false, admin: false}));
  }
}
