import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'laji-pill-list',
  templateUrl: './pill-list.component.html',
  styleUrls: ['./pill-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: true
})
export class PillListComponent implements OnInit {

  @Input() isLabel;
  @Output() updateList = new EventEmitter();

  _list;

  constructor() { }

  ngOnInit() {
  }

  @Input() set list(data) {
    if (typeof data === 'string') {
      this._list = data.split(',');
    } else if (Array.isArray(data)) {
      const items = [];
      data.map(item => items.push(...item.split(',')));
      this._list = items;
    }
  }

  remove(item) {
    this.updateList.emit(this._list.filter(value => value !== item))
  }

}
