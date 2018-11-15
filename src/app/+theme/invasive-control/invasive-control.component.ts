/* tslint:disable:component-selector */
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Rights } from '../../+haseka/form-permission/form-permission.service';
import { Observable } from 'rxjs';
import { MonitoringThemeBaseComponent } from '../common/monitoring-theme-base.component';

@Component({
  selector: '[laji-invasive-control]',
  templateUrl: './invasive-control.component.html',
  styleUrls: ['./invasive-control.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvasiveControlComponent
       extends MonitoringThemeBaseComponent
       implements OnInit {
  rights: Observable<Rights>;

  ngOnInit() {
    this.rights = this.getRights(environment.invasiveControlForm);
  }
}
