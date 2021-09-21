import { Directive, ElementRef, HostListener } from '@angular/core';
import { ENTER, SPACE } from '@angular/cdk/keycodes';

@Directive({
  selector: '[luKeyboardClickable]'
})
export class KeyboardClickableDirective {
  private keycodes = new Set([ENTER, SPACE]);

  constructor(private el: ElementRef) {}

  @HostListener('keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.target === this.el.nativeElement && this.keycodes.has(event.keyCode)) {
      this.el.nativeElement.click();
    }
  }
}
