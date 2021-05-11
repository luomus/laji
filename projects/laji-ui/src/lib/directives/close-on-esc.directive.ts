import { Directive, HostListener, EventEmitter, Output } from '@angular/core';
import { ESCAPE } from '@angular/cdk/keycodes';

@Directive({
  selector: '[luCloseOnEsc]'
})
export class CloseOnEscDirective {
  @Output() luCloseOnEsc = new EventEmitter();
  constructor() {}

  @HostListener('keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === ESCAPE) {
      this.luCloseOnEsc.emit();
    }
  }
}
