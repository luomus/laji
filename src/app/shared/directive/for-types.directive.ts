import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { environment } from '../../../environments/environment';

interface ILajiForTypesInput {
  types: string[];
  reverse: boolean;
}

@Directive({
  selector: '[lajiForTypes]'
})
export class ForTypesDirective {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) { }

  @Input() set lajiForTypes(types: string[] | ILajiForTypesInput) {
    let rev = false;
    if (!(types instanceof Array)) {
      types = <ILajiForTypesInput>types;
      rev = types.reverse;
      types = types.types;
    }
    if (
      (!rev && types.includes(environment.type))
      || (rev && !types.includes(environment.type))
    ) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

}
