import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  HostListener,
  OnChanges, SimpleChanges, OnInit, Inject, PLATFORM_ID
} from '@angular/core';
import { isPlatformServer } from '@angular/common';

export type ButtonRole = 'primary' | 'secondary' | 'neutral' | 'success' | 'warning' | 'danger' | 'other' | 'edit' ;

@Component({
  selector: 'lu-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent implements OnChanges, OnInit {
  @Input() role: ButtonRole = 'secondary';
  @Input() loading?: boolean;
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
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() click = new EventEmitter<MouseEvent>();
  @Input() queryParams?: any;

  routerLink?: string | string[];
  useHref = false;
  pressed = false;
  classes = {};

  isServer = false;

  @Input() set anchor(url: string|string[]) {
    this.routerLink = url;
    this.useHref = typeof url === 'string' && (url.startsWith('http') || url.includes('?'));
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isServer = isPlatformServer(this.platformId);
  }

  @HostListener('click', ['$event'])
  onHostClick(event: any) {
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
    (classes as any)['lu-disabled'] = this.disabled;
    (classes as any)[this.role] = true;
    this.classes = classes;
  }
}
