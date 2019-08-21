import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-pill-list',
  templateUrl: './pill-list.component.html',
  styleUrls: ['./pill-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: true
})
export class PillListComponent {

  @Input() separator = ',';
  @Input() isLabel;
  @Output() updateList = new EventEmitter();

  _list;

  @Input()
  set list(data) {
    if (typeof data === 'string') {
      this._list = data.split(this.separator);
    } else if (Array.isArray(data)) {
      const items = [];
      data.map(item => items.push(...item.split(this.separator)));
      this._list = items;
    }
  }

  remove(item) {
    this.updateList.emit(this._list.filter(value => value !== item));
  }

}
