import { AfterViewInit, Directive, ElementRef, HostListener, Input } from '@angular/core';

interface Coords {
  top: number;
  left: number;
  bottom: number;
  height: number;
  width: number;
  marginTop: number;
  marginBottom: number;
}

/**
 * Fixes the element to view when scrolling relative to parent container
 */
@Directive({
  selector: '[lajiFixedInView]'
})
export class FixedInViewDirective implements AfterViewInit {

  @Input() offsetTop = 0;
  @Input() offsetBottom = 0;
  @Input() fixedViewClass = 'fixed-to-view';
  @Input() fixedBottomClass = 'fixed-to-bottom';

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.updateDimensions();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updateDimensions();
    this.updatePos();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.updatePos();
  }

  private updateDimensions() {
    const containerCoords = this.getCoords(this.el.nativeElement.parentNode);
    this.el.nativeElement.style.width = containerCoords.width + 'px';
  }

  private updatePos() {
    const elem = this.getCoords(this.el.nativeElement);
    const container = this.getCoords(this.el.nativeElement.parentNode);
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    if (container.top + container.marginTop > scrollTop + this.offsetTop) {
      this.el.nativeElement.style.marginTop = '0';
      this.setActiveClass('');
      return;
    }
    const containerOffsetTop = this.offsetTop + container.marginTop;
    if (scrollTop + containerOffsetTop > container.bottom - elem.height - this.offsetBottom) {
      if (!this.hasActiveClass(this.fixedBottomClass)) {
        const marginTop = container.height - elem.height - this.offsetBottom;
        this.el.nativeElement.style.marginTop = marginTop > 0 ? marginTop + 'px' : '0';
        this.el.nativeElement.style.marginBottom = this.offsetBottom + 'px';
        this.setActiveClass(this.fixedBottomClass);
      }
      return;
    }
    if (!this.hasActiveClass(this.fixedViewClass)) {
      this.el.nativeElement.style.marginTop = -(containerOffsetTop) + 'px';
      this.setActiveClass(this.fixedViewClass);
    }
  }

  private setActiveClass(className: string) {
    if (className !== '' && this.hasActiveClass(className)) {
      return;
    }
    this.el.nativeElement.classList.remove(this.fixedViewClass);
    this.el.nativeElement.classList.remove(this.fixedBottomClass);
    if (className !== '') {
      this.el.nativeElement.classList.add(className);
    }
  }

  private hasActiveClass(className: string) {
    return this.el.nativeElement.classList.contains(className);
  }

  private getCoords(elem: Element): Coords {
    const box = elem.getBoundingClientRect();

    const body = document.body;
    const docEl = document.documentElement;

    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    const scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    const clientTop = docEl.clientTop || body.clientTop || 0;
    const clientLeft = docEl.clientLeft || body.clientLeft || 0;

    const top  = box.top +  scrollTop - clientTop;
    const left = box.left + scrollLeft - clientLeft;
    const bottom = top + box.height;

    const styles = window.getComputedStyle(elem);

    return {
      top: Math.round(top),
      left: Math.round(left),
      bottom: Math.round(bottom),
      height: Math.round(box.height),
      width: Math.round(box.width),
      marginTop: Math.ceil(parseFloat(styles['marginTop'])),
      marginBottom: Math.ceil(parseFloat(styles['marginBottom']))
    };
  }


}
