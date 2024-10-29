import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'laji-pill-list',
  templateUrl: './pill-list.component.html',
  styleUrls: ['./pill-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: true
})
export class PillListComponent {

  @Input() separator = ',';
  @Input() isLabel = false;
  @Input() isTaxonAutocomplete = false;
  @Input() selectedTaxonNames?: Array<string>;
  @Output() updateList = new EventEmitter();

  _list?: Array<string>;

  @Input()
  set list(data: Array<string> | string) {
    if (typeof data === 'string') {
      this._list = data.split(this.separator);
    } else if (Array.isArray(data)) {
      const items: Array<string> = [];
      data.map(item => items.push(...item.split(this.separator)));
      this._list = items;
    }
  }

  remove(item: string) {
    this.updateList.emit(this._list?.filter(value => value !== item));
  }

  findIndexValue(item: string) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (this.selectedTaxonNames!.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const index = this.selectedTaxonNames!.findIndex(i => i['id'] === item);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return index > -1 ? this.selectedTaxonNames![index]['value'] : null;
    } else {
      return null;
    }
  }
}
