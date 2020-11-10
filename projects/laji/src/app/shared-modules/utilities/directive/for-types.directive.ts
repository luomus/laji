import { Directive, Input, OnChanges, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Directive({
  selector: '[lajiForTypes]'
})
export class ForTypesDirective implements OnChanges {

  @Input() lajiForTypesExclude = false;
  @Input() lajiForTypes = [];

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
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
