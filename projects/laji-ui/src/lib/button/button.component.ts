import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter, HostListener} from '@angular/core';

type Role = 'primary' | 'secondary';

@Component({
  selector: 'lu-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() role: Role = 'secondary';
  @Input() disabled = false; // note: can't disable anchors
  @Input() anchor = false;
  @Output() click = new EventEmitter<MouseEvent>();

  pressed = false;

  @HostListener('click', ['$event'])
  onHostClick(event) {
    event.stopImmediatePropagation();
  }

  onClick(event: MouseEvent) {
    event.stopImmediatePropagation();
  }

  onMouseDown(event: MouseEvent) {
    this.pressed = true;
  }

  onMouseUp(event: MouseEvent) {
    this.click.emit(event);
    this.pressed = false;
  }
}
