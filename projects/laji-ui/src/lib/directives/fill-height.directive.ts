import { Directive, ElementRef, Renderer2, OnDestroy, AfterViewInit, Input, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface IFillHeightOptions {
  disabled: boolean;
  minHeight: number;
}

@Directive({
  selector: '[luFillHeight]'
})
export class FillHeightDirective implements OnDestroy, AfterViewInit {
  @Input('luFillHeight') options: IFillHeightOptions;

  private destroyLoadListener: () => void;
  private destroyResizeListener: () => void;

  constructor(private el: ElementRef,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit() {
    if (this.options.disabled) { return; }
    if (isPlatformBrowser(this.platformId) && document.readyState === 'complete') {
      this.onLoad();
    } else {
      this.destroyLoadListener = this.renderer.listen('window', 'load', this.onLoad.bind(this));
    }
  }

  private onLoad() {
    this.updateHeight();
    this.destroyResizeListener = this.renderer.listen(window, 'resize', this.onResize.bind(this));
  }

  private onResize(event) {
    if (event && event['ignore-fill-height']) {
      return;
    }
    this.updateHeight();
  }

  private updateHeight() {
    const boundingRect = this.el.nativeElement.getBoundingClientRect();
    let h = window.innerHeight - boundingRect.top;
    if (this.options.minHeight && h < this.options.minHeight) {
      h = this.options.minHeight;
    }
    this.renderer.setStyle(this.el.nativeElement, 'height', h.toString() + 'px');
    try {
      const event = new Event('resize');
      event['ignore-fill-height'] = true;
      window.dispatchEvent(event);
    } catch (e) {
      const evt = window.document.createEvent('UIEvents');
      evt['ignore-fill-height'] = true;
      // @ts-ignore
      evt.initUIEvent('resize', true, false, window, 0);
      window.dispatchEvent(evt);
    }
  }

  ngOnDestroy() {
    if (this.destroyLoadListener) { this.destroyLoadListener(); }
    if (this.destroyResizeListener) { this.destroyResizeListener(); }
  }
}
