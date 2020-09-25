import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { LocalStorageService, SessionStorage } from 'ngx-webstorage';

@Component({
  selector: 'laji-pill-list',
  templateUrl: './pill-list.component.html',
  styleUrls: ['./pill-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: true
})
export class PillListComponent implements OnInit {

  @Input() separator = ',';
  @Input() taxonAutocomplete = false;
  @Input() isLabel;
  @Output() updateList = new EventEmitter();

  _list;
  autocompleteNames = [];
  

  @Input()
  set list(data) {
    if (typeof data === 'string') {
      this._list = data.split(this.separator);
    } else if (Array.isArray(data)) {
      const items = [];
      data.map(item => items.push(...item.split(this.separator)));
      this._list = items;
    }
    this.autocompleteNames = this._list && this._list.length > 0 ? this.autocompleteNames : [];
  }

  constructor(
    private sessionStorage: LocalStorageService
  ) {
  }

  ngOnInit() {
    this.sessionStorage.observe('autocompleteNames').subscribe(
      value => this.autocompleteNames = value
    );
    this.autocompleteNames = this.sessionStorage.retrieve('autocompleteNames') ? this.sessionStorage.retrieve('autocompleteNames') : [];
  }

  remove(item) {
    if (this.taxonAutocomplete) {
      let tmp = this.autocompleteNames.filter(value => value.id !== item.id);
      this.autocompleteNames = tmp;
      this.sessionStorage.store('autocompleteNames', tmp);
      this.updateList.emit(this._list.filter(value => value !== item.id));
    } else {
      this.updateList.emit(this._list.filter(value => value !== item));
    }

  }

}
