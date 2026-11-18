import { Component, Input } from '@angular/core';

@Component({
  selector: 'laji-default-cell-template',
  template: `
    @if (value !== undefined && value !== null && value !== '') {
      <span title="{{ value }}">{{ value }}</span>
    }
  `
})
export class DefaultCellTemplateComponent {
  @Input() value: any;
}
