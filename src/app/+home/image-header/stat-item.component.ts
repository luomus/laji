import { Component, Input } from '@angular/core';

@Component({
  selector: 'laji-stat-item',
  template: `
    <div class="col-sm-3 text-left">
    <span class="stat-item-value">
      {{value}}
    </span>
    <br />
    <span class="stat-item-description">
      {{description}}
    </span>
  </div>
`
})
export class StatItemComponent {
  @Input() value: number;
  @Input() description: string;
}
