import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter, HostListener} from '@angular/core';

type Role = 'primary' | 'secondary' | 'neutral';

@Component({
  selector: 'lu-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() role: Role = 'secondary';
  @Input() disabled = false; // note: can't disable anchors
  @Input() small = false;
  private _target = undefined;
  @Input() set target(t) {
    this._target = t;
    this.useHref = true;
  }
  get target() {
    return this._target;
  }
  @Output() click = new EventEmitter<MouseEvent>();

  routerLink;
  useHref = false;
  pressed = false;

  @Input() set anchor(url: string) {
    this.routerLink = url;
    this.useHref = url.includes('?');
  }

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

  getNgClass() {
    const classes = {
      'lu-small-btn': this.small
    };
    classes[this.role] = true;
    return classes;
  }
}
