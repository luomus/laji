import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'll-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {
  @Input() size = 24;
  /* tslint:disable:max-line-length */
  @Input() type: 'close'|'drag-handle'|'logo'|'check'|'undo'|'redo'|'move'|'left'|'right'|'align-center'|'align-left'|'align-right'|'font-italic'|'font-bold'|'font-underline'|'save'|'load'|'up'|'down'|'edit'|'resize'|'refresh';
}


