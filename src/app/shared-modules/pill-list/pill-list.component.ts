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
  @Input() isTaxonAutocomplete = false;
  @Input() selectedTaxonNames: Array<string>;
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
    console.log(this._list)
    console.log(this.selectedTaxonNames)
  }

  remove(item) {
    this.updateList.emit(this._list.filter(value => value !== item));
  }

  findIndexValue(item) {
    if (this.selectedTaxonNames.length > 0) {
      let index = this.selectedTaxonNames.findIndex(i => i['id'] === item)
      return index > -1 ? this.selectedTaxonNames[index]['value'] : null;
    } else {
      return null;
    }
  }


}
