import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { environment } from '../../../environments/environment';

@Directive({
  selector: '[lajiForTypes]'
})
export class ForTypesDirective {

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) { }

  @Input() set lajiForTypes(types: string[]) {
    if (types.includes(environment.type)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
