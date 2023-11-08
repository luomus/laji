import { Component } from '@angular/core';

@Component({
  template: `{{ content }}`,
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent {
  content: string;
}
