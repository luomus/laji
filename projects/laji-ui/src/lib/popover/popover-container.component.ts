import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

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
  @Input() styleVariant: 'neutral-1' | 'neutral-2' = 'neutral-1';
  @Output() closePopover = new EventEmitter<void>();

  @HostBinding('class.style-variant-neutral-1')
  get neutral1Variant(): boolean {
    return this.styleVariant === 'neutral-1';
  }

  @HostBinding('class.style-variant-neutral-2')
  get neutral2Variant(): boolean {
    return this.styleVariant === 'neutral-2';
  }
}
