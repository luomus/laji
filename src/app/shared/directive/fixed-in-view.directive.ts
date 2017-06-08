import { AfterViewInit, Directive, ElementRef, HostListener, Input } from '@angular/core';

interface Coords {
  top: number;
  bottom: number;
  height: number;
  width: number;
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
    const container = this.getCoords(this.el.nativeElement.parentNode);
    this.el.nativeElement.style.width = container.width + 'px';
  }

  private updatePos() {
    const elem = this.getCoords(this.el.nativeElement);
    const container = this.getCoords(this.el.nativeElement.parentNode);
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    if (container.top > scrollTop + this.offsetTop) {
      this.el.nativeElement.style.marginTop = '0';
      this.setActiveClass('');
    } else if (scrollTop + this.offsetTop > container.bottom - elem.height - this.offsetBottom) {
      if (!this.hasActiveClass(this.fixedBottomClass)) {
        const marginTop = container.height - elem.height - this.offsetBottom;
        this.el.nativeElement.style.marginTop = marginTop > 0 ? marginTop + 'px' : '0';
        this.el.nativeElement.style.marginBottom = this.offsetBottom + 'px';
        this.setActiveClass(this.fixedBottomClass);
      }
    } else if (!this.hasActiveClass(this.fixedViewClass)) {
      this.el.nativeElement.style.marginTop = '0';
      this.el.nativeElement.style.top = this.offsetTop + 'px';
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
    const clientTop = docEl.clientTop || body.clientTop || 0;

    const top  = box.top +  scrollTop - clientTop;
    const bottom = top + box.height;

    return {
      top: Math.round(top),
      bottom: Math.round(bottom),
      height: Math.round(box.height),
      width: Math.round(box.width)
    };
  }


}
