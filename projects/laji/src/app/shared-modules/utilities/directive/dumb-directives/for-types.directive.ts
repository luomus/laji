import { Directive, Input, OnChanges, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Directive({
  selector: '[lajiForTypes]'
})
export class ForTypesDirective implements OnChanges {

  @Input() lajiForTypesExclude = false;
  @Input() lajiForTypes: string[] = [];

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) { }

  ngOnChanges() {
    if (
        (!this.lajiForTypesExclude && this.lajiForTypes.includes(environment.type))
        || (this.lajiForTypesExclude && !this.lajiForTypes.includes(environment.type))
    ) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
