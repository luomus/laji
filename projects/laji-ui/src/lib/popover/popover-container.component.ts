import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    template: `
    <div>
      @if (title) {
        <h5>{{ title }}</h5>
      }
      <div class="popover-content"><ng-content></ng-content></div>
    </div>
    @if (displayCloseBtn) {
      <div><button (click)="closePopover.next()">✕</button></div>
    }
    `,
    styleUrls: ['./popover-container.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PopoverContainerComponent {
  @Input() title = '';
  @Input() displayCloseBtn = false;
  @Output() closePopover = new EventEmitter<void>();
}
