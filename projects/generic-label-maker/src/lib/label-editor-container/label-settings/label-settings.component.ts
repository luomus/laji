import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LabelField, LabelItem, Setup } from '../../generic-label-maker.interface';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'll-label-settings',
  templateUrl: './label-settings.component.html',
  styleUrls: ['./label-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelSettingsComponent implements OnInit {

  @Input() setup: Setup;
  @Input() availableFields: LabelField[];
  @Output() setupChange = new EventEmitter<Setup>();
  showFieldFont = false;
  canDelete = false;
  private _selectedLabelItem: LabelItem;

  constructor() { }

  ngOnInit() {
  }

  @Input() set selectedLabelItem(item: LabelItem) {
    this._selectedLabelItem = item;
    if (item && item.fields) {
      this.canDelete = item.fields.length > 1;
      this.showFieldFont = item.fields[0] && item.fields[0].type !== 'qr-code';
    } else {
      this.canDelete = false;
      this.showFieldFont = false;
    }
  }

  get selectedLabelItem() {
    return this._selectedLabelItem;
  }

  change(field: string, style: any) {
    this.setupChange.emit({
      ...this.setup,
      [field]: {
        ...this.setup[field],
        ...style
      }
    });
  }

  changeSelectedItem(field: string, item: any) {
    const idx = this.setup.labelItems.findIndex(i => i === this._selectedLabelItem);
    if (idx === -1) {
      return;
    }
    this.setupChange.emit({
      ...this.setup,
      labelItems: [
        ...this.setup.labelItems.slice(0, idx),
        {
          ...this.setup.labelItems[idx],
          [field]: item
        },
        ...this.setup.labelItems.slice(idx + 1)
      ]
    });
  }

  remove(selectedLabelItem: LabelItem) {
    const idx = this.setup.labelItems.findIndex(i => i === selectedLabelItem);
    if (idx === -1) {
      return;
    }
    if (confirm('Are you sure that you want to remove this field?')) {
      this.setupChange.emit({
        ...this.setup,
        labelItems: [
          ...this.setup.labelItems.slice(0, idx),
          ...this.setup.labelItems.slice(idx + 1)
        ]
      });
    }
  }

  fieldRemove(idx: number) {
    const itemIdx = this.setup.labelItems.findIndex(i => i === this._selectedLabelItem);
    if (itemIdx === -1) {
      return;
    }
    this.setupChange.emit({
      ...this.setup,
      labelItems: [
        ...this.setup.labelItems.slice(0, itemIdx),
        {
          ...this.setup.labelItems[itemIdx],
          fields: [
            ...this.setup.labelItems[itemIdx].fields.slice(0, idx),
            ...this.setup.labelItems[itemIdx].fields.slice(idx + 1)
          ]
        },
        ...this.setup.labelItems.slice(itemIdx + 1)
      ]
    });
  }

  fieldAdd(labelField: LabelField) {
    const itemIdx = this.setup.labelItems.findIndex(i => i === this._selectedLabelItem);
    if (itemIdx === -1) {
      return;
    }
    this.setupChange.emit({
      ...this.setup,
      labelItems: [
        ...this.setup.labelItems.slice(0, itemIdx),
        {
          ...this.setup.labelItems[itemIdx],
          fields: [
            ...this.setup.labelItems[itemIdx].fields,
            labelField
          ]
        },
        ...this.setup.labelItems.slice(itemIdx + 1)
      ]
    });
  }

  fieldUpdate(labelField: LabelField, idx: number) {
    const itemIdx = this.setup.labelItems.findIndex(i => i === this._selectedLabelItem);
    if (itemIdx === -1) {
      return;
    }
    this.setupChange.emit({
      ...this.setup,
      labelItems: [
        ...this.setup.labelItems.slice(0, itemIdx),
        {
          ...this.setup.labelItems[itemIdx],
          fields: [
            ...this.setup.labelItems[itemIdx].fields.slice(0, idx),
            labelField,
            ...this.setup.labelItems[itemIdx].fields.slice(idx + 1)
          ]
        },
        ...this.setup.labelItems.slice(itemIdx + 1)
      ]
    });
  }

  drop(event: CdkDragDrop<LabelField[]>) {
    const itemIdx = this.setup.labelItems.findIndex(i => i === this._selectedLabelItem);
    if (itemIdx === -1) {
      return;
    }
    const list = [...this._selectedLabelItem.fields];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.setupChange.emit({
      ...this.setup,
      labelItems: [
        ...this.setup.labelItems.slice(0, itemIdx),
        {
          ...this.setup.labelItems[itemIdx],
          fields: list
        },
        ...this.setup.labelItems.slice(itemIdx + 1)
      ]
    });
  }
}
