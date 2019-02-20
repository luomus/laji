/* tslint:disable:component-selector */
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Rights } from '../../+haseka/form-permission/form-permission.service';
import { Observable } from 'rxjs';
import { MonitoringThemeBaseComponent } from '../common/monitoring-theme-base.component';

@Component({
  template: `
  <laji-lolife
    [rights]="rights$ | async">
  </laji-lolife>`,
  styles: [`
    :host {
        display: flex;
        flex: 1 0 auto;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvasiveControlContainerComponent
      extends MonitoringThemeBaseComponent
      implements OnInit {
  rights$: Observable<Rights>;

  ngOnInit() {
    this.rights$ = this.getRights(environment.lolifeForm);
  }
}
