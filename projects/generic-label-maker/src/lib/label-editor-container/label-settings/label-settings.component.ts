import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LabelItem, Setup } from '../../generic-label-maker.interface';

@Component({
  selector: 'll-label-settings',
  templateUrl: './label-settings.component.html',
  styleUrls: ['./label-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelSettingsComponent implements OnInit {

  @Input() setup: Setup;
  @Output() setupChange = new EventEmitter<Setup>();
  showFieldFont = false;
  private _selectedLabelItem: LabelItem;

  constructor() { }

  ngOnInit() {
  }

  @Input() set selectedLabelItem(item: LabelItem) {
    this._selectedLabelItem = item;
    this.showFieldFont = item && item.fields && item.fields[0] && !item.fields[0].isQRCode;
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
}
