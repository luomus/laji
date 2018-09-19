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
    if (types.indexOf(environment.type) !== -1) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
