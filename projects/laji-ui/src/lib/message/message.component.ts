import { Component, ChangeDetectionStrategy, Input, HostBinding } from '@angular/core';

type Type = 'primary' | 'neutral' | 'success' | 'info' | 'warning' | 'danger';

@Component({
  selector: 'lu-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageComponent {

  @HostBinding('attr.role') _role = 'contentinfo';

  @Input() title = '';
  @Input() class = '';

  _type: Type = 'info';

  @Input() set type(type: Type) {
    this._type = type;
    switch (type) {
      case 'danger':
      case 'warning':
        this._role = 'alert';
        break;
      case 'info':
        this._role = 'contentinfo';
        break;
      default:
        this._role = 'parenthetic';
        break;
    }
  }
}
