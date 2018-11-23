import { Component, Input } from '@angular/core';
import { Rights } from './invasive-control-instructions.container';

@Component({
  selector: 'laji-invasive-control-instructions',
  templateUrl: './invasive-control-instructions.component.html',
  styleUrls: ['./invasive-control-instructions.component.css']
})
export class InvasiveControlInstructionsComponent {
  Rights = Rights;

  @Input() rights: Rights = Rights.NotDefined;
  @Input() loggedIn: boolean;
}
