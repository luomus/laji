/* tslint:disable:component-selector max-classes-per-file */
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ngx-charts-tree-map',
  template: ''
})
export class NgxChartsTreeMapComponent {

  @Input() results: any;
  @Input() labelFormatting: any;
  @Input() valueFormatting: any;

  @Output() select = new EventEmitter<any>();
}
