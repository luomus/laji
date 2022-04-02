import { Directive, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { PlatformService } from '../../shared-modules/platform/platform.service';

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
