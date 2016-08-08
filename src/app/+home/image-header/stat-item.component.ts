import { Component, Input } from '@angular/core';
import { formattedNumber } from "../../shared";

@Component({
  selector: 'laji-stat-item',
  template: `
  <div class="col-sm-3 text-left">
    <span class="stat-item-value" [innerHtml]="value | formattedNumber:'&nbsp'">
    </span>
    <br />
    <span class="stat-item-description">
      {{description}}
    </span>
  </div>
`,
  styleUrls: ['./stat-item.component.css'],
  pipes: [formattedNumber]
})
export class StatItemComponent {
  @Input() value: number;
  @Input() description: string;
}
