import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FieldType, ILabelField, ILabelItem, ILabelValueMap, QRCodeErrorCorrectionLevel } from '../../label-designer.interface';
import { LabelService } from '../../label.service';
import { FieldKeyPipe } from '../../pipe/field-key.pipe';

/**
 * @internal
 */
@Component({
  selector: 'll-label-item',
  templateUrl: './label-item.component.html',
  styleUrls: ['../../../styles/ll-label.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelItemComponent {

  _item: ILabelItem;
  _originalFields: ILabelField[];
  _data: object;
  _map: ILabelValueMap;

  size;
  @Input() qrCodeErrorCorrectionLevel: QRCodeErrorCorrectionLevel = QRCodeErrorCorrectionLevel.levelM;

  constructor(private labelService: LabelService) { }

  @Input()
  set item(item: ILabelItem) {
    this._item = {...item, fields: [...item.fields]};
    this._originalFields = item.fields;
    this.size = this.labelService.mmToPixel(Math.min(item.style['height.mm'], item.style['width.mm']));
    this.initContent();
  }

  @Input()
  set data(data: object) {
    this._data = data;
    this.initContent();
  }

  @Input()
  set valueMap(map: ILabelValueMap) {
    this._map = map;
    this.initContent();
  }

  private initContent() {
    if (!this._item || typeof this._data === 'undefined') {
      return;
    }
    if (this._data === null) {
      this._item = {...this._item, fields: []};
      return;
    }

    let prev: string;
    const nextField = {};
    const fields: ILabelField[] = [];

    this._originalFields.forEach((field) => {
      const dataKey = FieldKeyPipe.getKey(field);
      if (prev) {
        nextField[prev] = dataKey;
      }
      prev = dataKey;
    });
    this._originalFields.forEach(field => {
      const dataKey = FieldKeyPipe.getKey(field);
      let newField: ILabelField;
      if (field.type === FieldType.text) {
        newField = {
          ...field,
          content: typeof this._data[dataKey] === 'undefined' ? field.content : this._data[dataKey]
        };
      } else if (field.separatorAlways || LabelService.hasValue(this._data[dataKey])) {
        newField = {
          ...field,
          content: LabelService.getFieldValue(field, this._data[dataKey], this._map, true) as string
        };
      }
      if (field.separatorOnlyWhenNextNotEmpty && nextField[dataKey] && !LabelService.hasValue(this._data[nextField[dataKey]])) {
        newField.separator = '';
      }
      if (newField) {
        fields.push(newField);
      }
    });
    this._item = {...this._item, fields};
  }
}
