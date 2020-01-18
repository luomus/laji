import { Directive, ElementRef, Renderer2, OnDestroy, AfterViewInit, Input } from '@angular/core';

@Directive({
  selector: '[luFillHeight]'
})
export class FillHeightDirective implements OnDestroy, AfterViewInit {
  @Input('luFillHeight') options: any;

  private destroyLoadListener: () => void;
  private destroyResizeListener: () => void;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    if (this.options.disabled) { return; }
    if (document.readyState === "complete") {
      this.onLoad();
    } else {
      this.destroyLoadListener = this.renderer.listen('window', 'load', this.onLoad.bind(this));
    }
  }

  private onLoad() {
    this.updateHeight();
    this.destroyResizeListener = this.renderer.listen(window, 'resize', this.onResize.bind(this));
  }

  private onResize() {
    if (event && event['ignore-fill-height']) {
      return;
    }
    this.updateHeight();
  }

  private updateHeight() {
    const boundingRect = this.el.nativeElement.getBoundingClientRect();
    const h = window.innerHeight - boundingRect.top;
    this.renderer.setStyle(this.el.nativeElement, 'height', h.toString() + 'px');
    try {
      const event = new Event('resize');
      event['ignore-fill-height'] = true;
      window.dispatchEvent(event);
    } catch (e) {
      const evt = window.document.createEvent('UIEvents');
      evt['ignore-fill-height'] = true;
      //@ts-ignore
      evt.initUIEvent('resize', true, false, window, 0);
      window.dispatchEvent(evt);
    }
  }

  ngOnDestroy() {
    if (this.destroyLoadListener) { this.destroyLoadListener() }
    if (this.destroyResizeListener) { this.destroyResizeListener() }
  }
}
