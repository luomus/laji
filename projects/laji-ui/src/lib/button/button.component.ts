import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  HostListener,
  OnChanges, SimpleChanges, OnInit
} from '@angular/core';

type Role = 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'danger' | 'other' ;

@Component({
  selector: 'lu-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent implements OnChanges, OnInit {
  @Input() role: Role = 'secondary';
  @Input() loading: boolean;
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
  @Input() queryParams;

  routerLink;
  useHref = false;
  pressed = false;
  classes = {};

  @Input() set anchor(url: string|string[]) {
    this.routerLink = url;
    this.useHref = typeof url === 'string' && (url.startsWith('http') || url.includes('?'));
  }

  @HostListener('click', ['$event'])
  onHostClick(event) {
    event.stopImmediatePropagation();
  }

  ngOnInit() {
    this.evalClasses();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.small || changes.disabled || changes.role) {
      this.evalClasses();
    }
  }

  onClick(event: MouseEvent) {
    event.stopImmediatePropagation();
  }

  onMouseDown() {
    this.pressed = true;
  }

  onMouseUp(event: MouseEvent) {
    this.click.emit(event);
    this.pressed = false;
  }

  evalClasses() {
    const classes = {
      'lu-btn-small': this.small
    };
    classes['lu-disabled'] = this.disabled;
    classes[this.role] = true;
    this.classes = classes;
  }
}
