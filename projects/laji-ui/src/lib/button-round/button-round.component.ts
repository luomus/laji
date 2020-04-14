import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'lu-button-round',
  templateUrl: '../button/button.component.html',
  styleUrls: ['../button/button.component.scss', './button-round.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonRoundComponent extends ButtonComponent {}
