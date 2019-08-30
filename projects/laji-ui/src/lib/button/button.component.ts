import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

type Role = 'primary' | 'secondary';

@Component({
  selector: 'lu-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() role: Role = 'secondary';
  @Input() disabled = false;
}
