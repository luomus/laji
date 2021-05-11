import { Directive, ElementRef, HostListener } from '@angular/core';
import { ENTER } from '@angular/cdk/keycodes';

@Directive({
  selector: '[luClickOnEnter]'
})
export class ClickOnEnterDirective {
  constructor(private el: ElementRef) {}

  @HostListener('keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.target === this.el.nativeElement && event.keyCode === ENTER) {
      this.el.nativeElement.click();
    }
  }
}
