import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AppConfig } from '../../app.config';

@Directive({ selector: '[lajiAuthorities]' })
export class AuthoritiesDirective {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private appConfig: AppConfig
  ) { }

  @Input() set lajiAuthorities(isAuthority: boolean) {
    if (this.appConfig.isForAuthorities() === isAuthority) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}