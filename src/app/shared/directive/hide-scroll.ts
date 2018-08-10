import { Directive, ElementRef, HostListener} from '@angular/core';

/**
 * Fixes the element to view when scrolling relative to parent container
 *
 * DO NOT USE THIS! ATM (will trigger change detection on very scroll)
 */
@Directive({
  selector: '[lajiHideScroll]',
})
export class HideScrollDirective {

  private disableWindowScroll = false;
  private isTouching = false;
  private el: any;

  constructor(ref: ElementRef) {
    this.el = ref.nativeElement;
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    try {
      if (!this.isTouching) {
        this.el.style.overflow = 'auto';
        this.disableWindowScroll = true;
      }
    } catch (e) {}
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    try {
      if (!this.isTouching) {
        this.el.style.overflow = 'hidden';
        this.disableWindowScroll = false;
      }
    } catch (e) {}
  }

  @HostListener('touchstart')
  onTouchStart() {
    try {
      this.isTouching = true;
      this.el.style.overflow = 'auto';
    } catch (e) {}
  }

  @HostListener('touchend')
  onTouchEnd() {
    try {
      this.isTouching = true;
      this.el.style.overflow = 'hidden';
    } catch (e) {}
  }

  @HostListener('window:wheel', ['$event'])
  onWindowWheel(event: any) {
    try {
      if (this.disableWindowScroll &&
        this.el.scrollHeight > this.el.offsetHeight &&
        (
          (event.deltaY < 0 && this.el.scrollTop === 0) ||
          (event.deltaY > 0 && (this.el.scrollTop + this.el.offsetHeight + 1) >= this.el.scrollHeight)
        )
      ) {
        let isTargetScrolling;
        let element = event.target;

        do {
          if (element === this.el) {
            isTargetScrolling = true;
            break;
          }
          if (element.scrollWidth > element.clientWidth) {
            isTargetScrolling = false;
            break;
          }
        } while (element = element.parentNode);
        if (isTargetScrolling) {
          event.stopPropagation();
          event.preventDefault();
        }
      }
    } catch (e) {console.log(e)}
  }
}
