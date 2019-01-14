import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LabelField, LabelItem } from '../../generic-label-maker.interface';
import { LabelService } from '../../label.service';

@Component({
  selector: 'll-label-item',
  templateUrl: './label-item.component.html',
  styleUrls: ['../../../styles/ll-label.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelItemComponent {


  _item: LabelItem;
  _data: object;

  size;

  constructor(private labelService: LabelService) { }

  @Input()
  set item(item: LabelItem) {
    this._item = item;
    this.size = this.labelService.mmToPixel(Math.min(item.style['height.mm'], item.style['width.mm']));
    this.initContent();
  }

  @Input()
  set data(data: object) {
    this._data = data;
    this.initContent();
  }

  initContent() {
    if (!this._data || !this._item) {
      return;
    }
    const fields = this._item.fields;
    const result: LabelField[] = [];
    fields.forEach(field => {
      if (this.labelService.hasValue(this._data, field.field)) {
        result.push({
          ...field,
          content: this._data[field.field]
        });
      }
    });
    this._item.fields = result;
  }
}
