import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  HostBinding,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: 'img[lajiLazyImage]'
})
export class LazyImageDirective implements AfterViewInit, OnDestroy {
  @HostBinding('attr.src') srcAttr = null;
  @Input() src: string;
  intersectionObsOptions = {
    rootMargin: '200px',
    threshold: 0
  };
  intersectionObs: IntersectionObserver;

  constructor(
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.canLazyLoad() ? this.lazyLoadImage() : this.loadImage();
    }
  }

  ngOnDestroy(): void {
    this.removeObserver();
  }

  private canLazyLoad() {
    return window && 'IntersectionObserver' in window;
  }

  private lazyLoadImage() {
    this.zone.runOutsideAngular(() => {
      this.addViewObserver();
    });
  }

  private addViewObserver() {
    this.intersectionObs = new IntersectionObserver(entries => {
      entries.forEach(({ isIntersecting }) => {
        if (isIntersecting) {
          this.loadImage();
          this.removeObserver();
        }
      });
    }, this.intersectionObsOptions);
    this.intersectionObs.observe(this.el.nativeElement);
  }

  private loadImage() {
    this.srcAttr = this.src;
    this.cdr.detectChanges();
  }

  private removeObserver() {
    if (this.intersectionObs) {
      this.intersectionObs.unobserve(this.el.nativeElement);
    }
  }
}
