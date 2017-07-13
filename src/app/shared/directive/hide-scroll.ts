import { Directive, ElementRef, HostListener } from '@angular/core';

/**
 * Fixes the element to view when scrolling relative to parent container
 */
@Directive({
  selector: '[laji-hide-scroll]',
})
export class HideScrollDirective {

  constructor(private el: ElementRef) {}


  @HostListener('mouseenter')
  onEnter() {
    this.el.nativeElement.style.overflow = 'auto';
  }

  @HostListener('mouseleave')
  onLeave() {
    this.el.nativeElement.style.overflow = 'hidden';
  }
}
