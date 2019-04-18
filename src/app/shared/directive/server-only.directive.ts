import { Directive, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { PlatformService } from '../service/platform.service';

@Directive({ selector: '[lajiServerOnly]' })
export class ServerOnlyDirective implements OnInit {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private platformService: PlatformService
  ) { }

  ngOnInit() {
    if (this.platformService.isServer) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
