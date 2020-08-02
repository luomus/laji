import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'laji-theme',
  templateUrl: './theme.component.html',
  styleUrls: [
    '../../../../../src/app/+theme/theme.component.css',
    './theme.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeComponent {

}
