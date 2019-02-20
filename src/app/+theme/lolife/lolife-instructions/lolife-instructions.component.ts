import { Component, Input } from '@angular/core';
import { Rights } from './lolife-instructions.container';

@Component({
  selector: 'laji-lolife-instructions',
  templateUrl: './lolife-instructions.component.html',
  styleUrls: ['./lolife-instructions.component.css']
})
export class InvasiveControlInstructionsComponent {
  Rights = Rights;

  @Input() rights: Rights = Rights.NotDefined;
  @Input() loggedIn: boolean;
}
