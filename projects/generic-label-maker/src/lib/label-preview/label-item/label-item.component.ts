import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ILabelField, ILabelItem } from '../../generic-label-maker.interface';
import { LabelService } from '../../label.service';

@Component({
  selector: 'll-label-item',
  templateUrl: './label-item.component.html',
  styleUrls: ['../../../styles/ll-label.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelItemComponent {


  _item: ILabelItem;
  _data: object;

  size;

  constructor(private labelService: LabelService) { }

  @Input()
  set item(item: ILabelItem) {
    this._item = item;
    this.size = this.labelService.mmToPixel(Math.min(item.style['height.mm'], item.style['width.mm']));
    this.initContent();
  }

  @Input()
  set data(data: object) {
    this._data = data;
    this.initContent();
  }

  private initContent() {
    if (!this._data || !this._item) {
      return;
    }
    const fields = this._item.fields;
    const result: ILabelField[] = [];
    fields.forEach(field => {
      if (field.type === 'text') {
        result.push({...field});
      } else if (field.separatorAlways || this.labelService.hasValue(this._data, field.field)) {
        result.push({
          ...field,
          content: this.getFieldValue(field, this._data[field.field])
        });
      }
    });
    this._item.fields = result;
  }

  private getFieldValue(field: ILabelField, value: any): string {
    if (typeof value === 'undefined' || value === null) {
      return '';
    }
    if (Array.isArray(value)) {
      return value.map(val => this.getFieldValue(field, val)).join(field.join || ', ');
    }
    return field.valueMap && field.valueMap[value] || value;
  }
}
