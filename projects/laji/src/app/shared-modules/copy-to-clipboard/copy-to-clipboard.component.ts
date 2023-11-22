import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { PlatformService } from '../../root/platform.service';

@Component({
  selector: 'laji-copy-to-clipboard',
  template: `
    <div
      class="copy-to-clipboard"
      [ngClass]="{'wrap-text': wrapText, 'd-flex': !wrapText}"
      (click)="onCopyToClipboard(value, $event)"
      tabindex="0"
      luKeyboardClickable
    >
      <span class="glyphicon glyphicon-paperclip mr-2"></span> {{ visibleText ? visibleText : value }}
    </div>
  `,
  styleUrls: ['./copy-to-clipboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CopyToClipboardComponent {
  @Input() value = '';
  @Input() visibleText?: string;
  @Input() wrapText = false;

  constructor(
    private platformService: PlatformService
  ) { }

  onCopyToClipboard(str: string, event: MouseEvent) {
    this.platformService.window.navigator.clipboard.writeText(str);
    event.stopPropagation();
  }
}
