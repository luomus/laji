import { Component, Input } from '@angular/core';
import { Rights } from './municipality-monitoring-instructions.container';

@Component({
  selector: 'laji-municipality-monitoring-instructions',
  templateUrl: './municipality-monitoring-instructions.component.html',
  styleUrls: ['./municipality-monitoring-instructions.component.css']
})
export class MunicipalityMonitoringInstructionsComponent {
  Rights = Rights;

  @Input() rights: Rights = Rights.NotDefined;
  @Input() loggedIn: boolean;
}
