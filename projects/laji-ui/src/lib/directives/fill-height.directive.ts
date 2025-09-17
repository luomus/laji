import { Directive, ElementRef, Renderer2, OnDestroy, AfterViewInit, Input, Inject, PLATFORM_ID, OnChanges } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Util } from 'projects/laji/src/app/shared/service/util.service';
import { PlatformService } from 'projects/laji/src/app/root/platform.service';

export interface IFillHeightOptions {
  disabled?: boolean;
  minHeight?: number;
  height?: number|string|undefined; // sets height to a constant value effectively disabling the fillHeight functionality
}

@Directive({
  selector: '[luFillHeight]'
})
export class FillHeightDirective implements OnDestroy, AfterViewInit, OnChanges {
  @Input('luFillHeight') options!: IFillHeightOptions;

  private destroyLoadListener?: () => void;
  private destroyResizeListener?: () => void;

  constructor(private el: ElementRef,
    private renderer: Renderer2,
    private platformService: PlatformService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId) && document.readyState === 'complete') {
      this.onLoad();
    } else {
      this.destroyLoadListener = this.renderer.listen('window', 'load', this.onLoad.bind(this));
    }
  }

  ngOnChanges() {
    if (isPlatformBrowser(this.platformId)) {
      this.updateHeight();
    }
  }

  private onLoad() {
    this.updateHeight();
    this.destroyResizeListener = this.renderer.listen(window, 'resize', this.onResize.bind(this));
  }

  private onResize(event: any) {
    if (event && event['ignore-fill-height']) {
      return;
    }
    this.updateHeight();
  }

  updateHeight() {
    if (this.options.disabled) { return; }
    const boundingRect = this.el.nativeElement.getBoundingClientRect();
    let h: number|string = window.innerHeight - boundingRect.top;
    if (this.options.minHeight && h < this.options.minHeight) {
      h = this.options.minHeight;
    }
    if (this.options.height) {
      h = this.options.height;
    }
    if (typeof h === 'number') {
      h = h.toString() + 'px';
    }
    this.renderer.setStyle(this.el.nativeElement, 'height', h);
    Util.dispatchResizeEvent(this.platformService, 'ignore-fill-height');
  }

  ngOnDestroy() {
    if (this.destroyLoadListener) { this.destroyLoadListener(); }
    if (this.destroyResizeListener) { this.destroyResizeListener(); }
  }
}
