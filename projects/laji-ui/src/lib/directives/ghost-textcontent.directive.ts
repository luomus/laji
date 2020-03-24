import { Directive, ElementRef, Renderer2, OnInit, Inject, PLATFORM_ID, OnDestroy, Input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Adds .lu-ghost-textcontent class whenever textContent is missing or empty
 */
@Directive({
  selector: '[luGhostTextContent]'
})
export class GhostTextContentDirective implements OnInit, OnDestroy {
  @Input() disableTextContentGhost = false;
  destroyListener: Function;
  constructor(private el: ElementRef, private renderer: Renderer2, @Inject(PLATFORM_ID) private platformId: Object) {}
  ngOnInit() {
    if (isPlatformBrowser(this.platformId) && !this.disableTextContentGhost && (!this.el.nativeElement || this.el.nativeElement.textContent.trim().length === 0)) {
      this.renderer.addClass(this.el.nativeElement, 'lu-ghost-textcontent');
      this.destroyListener = this.renderer.listen(this.el.nativeElement, 'DOMSubtreeModified', () => {
        if (this.el.nativeElement.textContent.trim().length > 0) {
          this.renderer.removeClass(this.el.nativeElement, 'lu-ghost-textcontent');
        }
      });
    }
  }
  ngOnDestroy() {
    if (this.destroyListener) {
      this.destroyListener();
    }
  }
}
