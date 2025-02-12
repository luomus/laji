import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';

/**
 * @ignore
 */
const ICON_SIZE = 24;

/**
 * @internal
 */
@Component({
  selector: 'll-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {
  _size = ICON_SIZE;
  /* eslint-disable max-len */
  @Input({ required: true }) type!: 'close'|'drag-handle'|'logo'|'check'|'undo'|'redo'|'move'|'left'|'right'|'align-center'|'align-left'|'align-right'|'font-italic'|'font-bold'|'font-underline'|'save'|'load'|'up'|'down'|'edit'|'resize'|'refresh';

  @HostBinding('style.height.px') height = ICON_SIZE;
  @HostBinding('style.width.px') width = ICON_SIZE;

  @Input() set size(size: number) {
    this.width = size;
    this.height = size;
    this._size = size;
  }

  get size(): number {
    return this._size;
  }
}


