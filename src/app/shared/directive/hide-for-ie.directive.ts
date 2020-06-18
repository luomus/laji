import { Directive, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { WINDOW } from '@ng-toolkit/universal';
import { PlatformService } from '../service/platform.service';

@Directive({ selector: '[lajiHideForIe]' })
export class HideForIeDirective implements OnInit {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private platformService: PlatformService
  ) { }

  ngOnInit() {
    if (!(this.platformService.isBrowser && /MSIE|Trident/.test(window.navigator.userAgent))) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
