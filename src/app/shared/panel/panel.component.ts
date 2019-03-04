/* tslint:disable:component-selector */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: '[laji-panel]',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css'],
  animations: [
    trigger('visibilityState', [
      state('in' , style({ height: '*' })),
      state('out', style({ height: 0 })),
      transition('in <=> out', animate('100ms'))
    ])
  ]
})
export class PanelComponent {
  @Input() title: string;
  @Input() index: number;
  @Input() open = false;
  @Input() autoToggle = false;
  @Input() headerLink = true;
  @Output() activate = new EventEmitter();
  public hideInside = true;

  activateCurrent() {
    if (this.autoToggle) {
      this.open = !this.open;
    }
    this.activate.emit({
      value: this.index,
      open: this.open
    });
  }

  animationStart(event) {
    if (event.toState === 'out') {
      this.hideInside = true;
    }
  }

  animationDone(event) {
    if (event.toState === 'in') {
      this.hideInside = false;
    }
  }
}
