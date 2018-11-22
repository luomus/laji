/* tslint:disable:component-selector */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormPermissionService, Rights } from '../../+haseka/form-permission/form-permission.service';
import { Observable, of as ObservableOf } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { FormService } from '../../shared/service/form.service';

@Component({
    template: ``,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MonitoringThemeBaseComponent {

  constructor(
    protected formService: FormService,
    protected formPermissionService: FormPermissionService,
    protected translateService: TranslateService
  ) { }

  protected getRights(formId): Observable<Rights> {
    return this.formService.getForm(formId, this.translateService.currentLang)
    .switchMap(form => this.formPermissionService.getRights(form))
    .catch(() => ObservableOf({edit: false, admin: false}));
  }
}
