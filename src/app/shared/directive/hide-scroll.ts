import { Directive, ElementRef, HostListener } from '@angular/core';

/**
 * Fixes the element to view when scrolling relative to parent container
 */
@Directive({
  selector: '[lajiHideScroll]',
})
export class HideScrollDirective {

  private disableWindowScroll = false;
  private el: any;

  constructor(ref: ElementRef) {
    this.el = ref.nativeElement;
  }

  @HostListener('mouseenter')
  onEnter() {
    this.el.style.overflow = 'auto';
    this.disableWindowScroll = true;
  }

  @HostListener('mouseleave')
  onLeave() {
    this.el.style.overflow = 'hidden';
    this.disableWindowScroll = false;
  }

  @HostListener('window:wheel', ['$event'])
  onWindowScroll(event: WheelEvent) {
    if (this.disableWindowScroll &&
      (
        (event.deltaY < 0 && this.el.scrollTop === 0) ||
        (event.deltaY > 0 && (this.el.scrollTop + this.el.offsetHeight + 1) >= this.el.scrollHeight)
      )
    ) {
      event.stopPropagation();
      event.preventDefault();
    }
  }
}
