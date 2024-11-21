import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  HostBinding,
  Input,
  NgZone,
  OnDestroy
} from '@angular/core';
import { PlatformService } from '../../root/platform.service';

@Directive({
  selector: 'img[lajiLazyImage]'
})
export class LazyImageDirective implements AfterViewInit, OnDestroy {
  @HostBinding('attr.src') srcAttr?: string = '/static/images/empty.gif';
  @Input() src?: string;
  intersectionObsOptions = {
    rootMargin: '200px',
    threshold: 0
  };
  intersectionObs?: IntersectionObserver;

  constructor(
    private el: ElementRef,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private platformService: PlatformService
  ) {}

  ngAfterViewInit() {
    if (this.platformService.isBrowser) {
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
