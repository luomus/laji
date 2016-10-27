import { Component, Input } from '@angular/core';

@Component({
  selector: 'laji-stat-item',
  template: `
  <div class="{{colClass}} text-left">
    <span class="stat-item-value">
      <ng-content></ng-content>
    </span>
    <br />
    <span class="stat-item-description">
      {{description}}
    </span>
  </div>
`,
  styleUrls: ['./stat-item.component.css']
})
export class StatItemComponent {
  @Input() value: number;
  @Input() description: string;
  @Input() colClass: string = 'col-sm-3';
}
