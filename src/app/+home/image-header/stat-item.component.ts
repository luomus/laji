import { Component, Input } from '@angular/core';
import { FormattedNumber } from "../../shared";

@Component({
  selector: 'laji-stat-item',
  template: `
  <div class="col-sm-3 text-left">
    <span class="stat-item-value">
      <ng-content></ng-content>
    </span>
    <br />
    <span class="stat-item-description">
      {{description}}
    </span>
  </div>
`,
  styleUrls: ['./stat-item.component.css'],
  pipes: [FormattedNumber]
})
export class StatItemComponent {
  @Input() value: number;
  @Input() description: string;
}
