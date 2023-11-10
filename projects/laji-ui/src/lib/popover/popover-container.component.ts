import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  template: `<h5 *ngIf="title">{{ title }}</h5><div class="popover-content"><ng-content></ng-content></div>`,
  styleUrls: ['./popover-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverContainerComponent {
  @Input() title = '';
}
