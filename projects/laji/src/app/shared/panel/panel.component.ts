/* eslint-disable @angular-eslint/component-selector */
import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

@Component({
  selector: '[laji-panel]',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
})
export class PanelComponent {
  @Input() title?: string;
  @Input() headingTemplate?: TemplateRef<any>;
  @Input() index?: number;
  @Input() open = false;
  @Input() autoToggle = false;
  @Input() headerLink = true;
  @Output() activate = new EventEmitter();

  activateCurrent() {
    if (this.autoToggle) {
      this.open = !this.open;
    }
    this.activate.emit({
      value: this.index,
      open: this.open
    });
  }
}
