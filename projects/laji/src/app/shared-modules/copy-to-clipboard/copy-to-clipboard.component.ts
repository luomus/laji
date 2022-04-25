import { Component, Input, Inject, ChangeDetectionStrategy } from '@angular/core';
import { WINDOW } from '@ng-toolkit/universal';

@Component({
  selector: 'laji-copy-to-clipboard',
  template: `
    <div class="copy-to-clipboard wrapword d-flex" [ngClass]="{'wrapword': wrapText}" (click)="onCopyToClipboard(value, $event)" tabindex="0" luKeyboardClickable>
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
    @Inject(WINDOW) private window: Window
  ) { }

  onCopyToClipboard(str: string, event: MouseEvent) {
    this.window.navigator.clipboard.writeText(str);
    event.stopPropagation();
  }
}
