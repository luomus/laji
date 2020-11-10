import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'vir-theme',
  templateUrl: './theme.component.html',
  styleUrls: [
    '../../../../laji/src/app/+theme/theme.component.scss',
    './theme.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeComponent {

}
