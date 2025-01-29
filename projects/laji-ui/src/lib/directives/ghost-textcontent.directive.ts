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

  mutationObserver?: MutationObserver;

  constructor(private el: ElementRef, private renderer: Renderer2, @Inject(PLATFORM_ID) private platformId: any) {}

  ngOnInit() {
    if (
      isPlatformBrowser(this.platformId)
      && !this.disableTextContentGhost
      && (!this.el.nativeElement || this.el.nativeElement.textContent.trim().length === 0)
    ) {
      this.renderer.addClass(this.el.nativeElement, 'lu-ghost-textcontent');
      this.mutationObserver = new MutationObserver((mutationList, mutationObserver) => {
        if (this.el.nativeElement.textContent.trim().length > 0) {
          this.renderer.removeClass(this.el.nativeElement, 'lu-ghost-textcontent');
          mutationObserver.disconnect();
        }
      });
      this.mutationObserver.observe(this.el.nativeElement, { characterData: true, subtree: true });
    }
  }

  ngOnDestroy() {
    this.mutationObserver?.disconnect();
  }
}
