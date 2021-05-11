import { Directive, ElementRef, HostListener } from '@angular/core';

enum KEY_CODE {
  ENTER = 13
}

@Directive({
  selector: '[luA11yClick]'
})
export class a11yClickDirective {
  constructor(private el: ElementRef) {}

  @HostListener('keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.target === this.el.nativeElement && event.keyCode === KEY_CODE.ENTER) {
      this.el.nativeElement.click();
    }
  }
}
