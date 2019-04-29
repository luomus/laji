import { Directive, Inject, OnInit, PLATFORM_ID, TemplateRef, ViewContainerRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { WINDOW } from '@ng-toolkit/universal';

@Directive({ selector: '[lajiHideForIe]' })
export class HideForIeDirective implements OnInit {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(WINDOW) private window: Window,
  ) { }

  ngOnInit() {
    if (!(isPlatformBrowser(this.platformId) && /MSIE|Trident/.test(this.window.navigator.userAgent))) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
