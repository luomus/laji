import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

type Role = 'primary' | 'secondary';

@Component({
  selector: 'lu-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('clicked', [
      state('unclicked', style({
        'box-shadow': '*',
        'background-color': '*',
        'color': '*'
      })),
      state('clicked', style({
        'box-shadow': '0 0px 1px #c7cdd1',
        'background-color': '{{bg}}',
        'color': '{{color}}'
      }), {params: {
        bg: '#cfeafc',
        color: '#1f74ad',
      }}),
      transition('unclicked<=>clicked', animate('200ms')),
    ]),
    trigger('disabled', [
      state('active', style({
        'background-color': '*',
        'box-shadow': '*'
      })),
      state('disabled', style({
        'background-color': 'rgba(0, 0, 0, 0)',
        'box-shadow': '0 0 0 #c7cdd1'
      })),
      transition('active<=>disabled', animate('500ms')),
    ])
  ]
})
export class ButtonComponent {
  private _role: Role = 'secondary';
  @Input() set role(role: Role) {
    this._role = role;
    switch(role) {
      case 'primary':
        this.clickedStyles["background-color"] = '#0f598a'
        this.clickedStyles["color"] = '#e3e6e8';
        break;
      case 'secondary':
        this.clickedStyles["background-color"] = '#cfeafc'
        this.clickedStyles["color"] = '#1f74ad';
        break;
    }
  }
  get role(): Role {
    return this._role;
  }
  @Input() disabled = false;

  clickedStyles = {}
  clicked: 'unclicked' | 'clicked' = 'unclicked';
  constructor(private cdr: ChangeDetectorRef) {}
  onClick() {
    this.clicked = 'clicked';
  }
  onAnimationDone() {
    setTimeout(() => {
      this.clicked = 'unclicked';
      this.cdr.detectChanges();
    }, 100);
  }
}
