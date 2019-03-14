import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'll-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {
  @Input() size = 24;
  @Input() type: 'close'|'drag-handle'|'logo'|'check'|'undo'|'redo';
}


