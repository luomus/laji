import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  template: `
    <div>
      <h5 *ngIf="title">{{ title }}</h5>
      <div class="popover-content"><ng-content></ng-content></div>
    </div>
    <div *ngIf="displayCloseBtn"><button (click)="closePopover.next()">x</button></div>
  `,
  styleUrls: ['./popover-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverContainerComponent {
  @Input() title = '';
  @Input() displayCloseBtn = false;
  @Output() closePopover = new EventEmitter<void>();
}
