/* tslint:disable:component-selector */
import { ChangeDetectionStrategy, Component, OnInit, Input } from '@angular/core';
import { Rights } from '../../+haseka/form-permission/form-permission.service';

@Component({
  selector: 'laji-municipality-monitoring',
  templateUrl: './municipality-monitoring.component.html',
  styleUrls: ['./municipality-monitoring.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MunicipalityMonitoringComponent {
  @Input() rights: Rights;
}
