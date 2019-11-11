import { Component, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { trigger, style, transition, animate, keyframes } from '@angular/animations';

interface IButtonStyle {
  backgroundColor: string;
  color: string;
}

interface IButtons {
  primary: IButtonStyle;
  secondary: IButtonStyle;
}

type Role = keyof IButtons;

const clickedStyles: IButtons = {
  primary: {
    backgroundColor: '#0f598a',
    color: '#e3e6e8'
  },
  secondary: {
    backgroundColor: '#cfeafc',
    color: '#1f74ad'
  }
};

@Component({
  selector: 'lu-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('clicked', [
      transition('unclicked=>clicked', animate('400ms', keyframes([
        style({
          'box-shadow': '*',
          'background-color': '*',
          'color': '*'
        }),
        style({
          'box-shadow': '0 0px 1px #c7cdd1',
          'background-color': '{{backgroundColor}}',
          'color': '{{color}}'
        }),
        style({
          'box-shadow': '*',
          'background-color': '*',
          'color': '*'
        }, )
      ])), {params: clickedStyles.secondary}
      ),
    ])
  ]
})
export class ButtonComponent {
  private _role: Role = 'secondary';

  @Input() set role(role: Role) {
    this._role = role;
    this.clickedStyles = clickedStyles[role];
  }
  get role(): Role {
    return this._role;
  }
  @Input() disabled = false;
  @Output() click = new EventEmitter<MouseEvent>();

  clickedStyles = clickedStyles[this._role];
  clicked: 'unclicked' | 'clicked' = 'unclicked';

  onClick(event: MouseEvent) {
    event.stopImmediatePropagation();
    if (this.clicked === 'unclicked') {
      this.clicked = 'clicked';
      this.click.emit(event); // this is here in case we want to limit the click rate?
    }
  }

  onAnimationDone() {
    this.clicked = 'unclicked';
  }
}
