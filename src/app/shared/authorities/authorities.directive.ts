import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Global } from '../../../environments/global';

@Directive({ selector: '[lajiAuthorities]' })
export class AuthoritiesDirective {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) { }

  @Input() set lajiAuthorities(isAuthority: boolean) {
    const forAuthorities = environment.type === Global.type.vir;
    if (forAuthorities === isAuthority) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
