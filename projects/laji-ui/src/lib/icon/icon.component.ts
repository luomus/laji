import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'lu-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {

  @Input() type!: 'close' | 'menu';

}
