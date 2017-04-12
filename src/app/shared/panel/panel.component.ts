import { animate, Component, EventEmitter, Input, Output, state, style, transition, trigger } from '@angular/core';

@Component({
  selector: '[laji-panel]',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css'],
  animations: [
    trigger('visibilityState', [
      state('in' , style({ height: '*' })),
      state('out', style({ height: 0 })),
      transition('in <=> out', animate('200ms'))
    ])
  ]
})
export class PanelComponent {
  @Input() title: string;
  @Input() index: number;
  @Input() open: boolean = false;
  @Input() autoToggle: boolean = false;
  @Input() headerLink: boolean = true;
  @Output() activate = new EventEmitter();
  public hideInside = true;

  activateCurrent() {
    if (this.autoToggle) {
      this.open = !this.open;
    }
    this.activate.emit({
      value: this.index
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
