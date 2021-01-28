import { Directive, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

/** https://willtaylor.blog/click-outside-directive/ */

@Directive({
  selector: '[luClickOutside]',
})
export class ClickOutsideDirective {

  @Output() clickOutside = new EventEmitter<void>();

  constructor(private elementRef: ElementRef) { }

  @HostListener('document:click', ['$event.target'])
  public onClick(target) {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
