/* tslint:disable:component-selector */
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Rights } from '../../+haseka/form-permission/form-permission.service';
import { Observable } from 'rxjs';
import { MonitoringThemeBaseComponent } from '../common/monitoring-theme-base.component';

@Component({
  selector: '[laji-invasive-control-container]',
  template: `
  <laji-invasive-control
    [rights]="rights | async"
    class="container-fluid">
  </laji-invasive-control>`,
  styles: [`
    .container-fluid {
        padding: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvasiveControlContainerComponent
      extends MonitoringThemeBaseComponent
      implements OnInit {
  rights: Observable<Rights>;

  ngOnInit() {
    this.rights = this.getRights(environment.invasiveControlForm);
  }
}
