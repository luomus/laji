import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: '[laji-panel]',
  templateUrl: './panel.component.html'
})
export class PanelComponent {
  @Input() title: string;
  @Input() index: number;
  @Input() open: boolean = false;
  @Input() autoToggle: boolean = false;
  @Output() activate = new EventEmitter();

  activateCurrent() {
    if (this.autoToggle) {
      this.open = !this.open;
    }
    this.activate.emit({
      value: this.index
    });
  }
}
