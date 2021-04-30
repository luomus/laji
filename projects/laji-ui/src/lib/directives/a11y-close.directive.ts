import { Directive, ElementRef, HostListener, EventEmitter, Output } from '@angular/core';

enum KEY_CODE {
  ESC = 27
}

@Directive({
  selector: '[luA11yClose]'
})
export class a11yCloseDirective {
  @Output() luA11yClose = new EventEmitter();
  constructor() {}

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.keyCode === KEY_CODE.ESC) {
      this.luA11yClose.emit();
    }
  }
}
