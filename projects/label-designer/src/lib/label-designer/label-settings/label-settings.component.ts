import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FieldType, ILabelField, ILabelItem, ISetup, TLabelLocation } from '../../label-designer.interface';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateService } from '../../translate/translate.service';
import { Presets } from '../../presets';
import { LabelMakerFacade } from '../label-maker.facade';

/**
 * @internal
 */
@Component({
  selector: 'll-label-settings',
  templateUrl: './label-settings.component.html',
  styleUrls: ['./label-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabelSettingsComponent {

  @Input() setup: ISetup;
  @Input() availableFields: ILabelField[];
  @Output() setupChange = new EventEmitter<ISetup>();
  showFieldFont = false;
  canDelete = false;
  borders = Presets.Border;

  private _selectedLabelItem: ILabelItem;

  constructor(
    private translateService: TranslateService,
    private labelMakerFacade: LabelMakerFacade
  ) { }

  @Input() set selectedLabelItem(item: ILabelItem) {
    this._selectedLabelItem = item;
    if (item && item.fields) {
      this.canDelete = item.fields.length > 1;
      this.showFieldFont = item.fields[0] && item.fields[0].type !== FieldType.qrCode;
    } else {
      this.canDelete = false;
      this.showFieldFont = false;
    }
  }

  get selectedLabelItem(): ILabelItem {
    return this._selectedLabelItem;
  }

  change<K extends keyof Pick<ISetup, 'label' | 'page' | 'border' | 'twoSided'>, T extends ISetup[K]>(field: K, value: T): void {
    if (['border', 'twoSided'].includes(field)) {
      this.setupChange.emit({
        ...this.setup,
        [field]: value
      });
    } else {
      this.setupChange.emit({
        ...this.setup,
        [field]: {
          ...this.setup[field] as Record<string, any>,
          ...value as Record<string, any>
        } as any
      });
    }
    this.labelMakerFacade.hasChanges(true);
  }

  changeSelectedItem<K extends keyof ILabelItem, T extends ILabelItem[K]>(field: K, item: T): void {
    const {itemIdx, location} = this.findItem();
    if (itemIdx === -1) {
      return;
    }
    this.setupChange.emit({
      ...this.setup,
      [location]: [
        ...this.setup[location].slice(0, itemIdx),
        {
          ...this.setup[location][itemIdx],
          [field]: item
        },
        ...this.setup[location].slice(itemIdx + 1)
      ]
    });
  }

  remove(selectedLabelItem: ILabelItem): void {
    const {itemIdx, location} = this.findItem(selectedLabelItem);
    if (itemIdx === -1) {
      return;
    }
    if (confirm(this.translateService.get('Are you sure that you want to remove this field?'))) {
      this.setupChange.emit({
        ...this.setup,
        [location]: [
          ...this.setup[location].slice(0, itemIdx),
          ...this.setup[location].slice(itemIdx + 1)
        ]
      });
      this.labelMakerFacade.hasChanges(true);
    }
  }

  fieldRemove(idx: number): void {
    const {itemIdx, location} = this.findItem();
    if (itemIdx === -1) {
      return;
    }
    this.setupChange.emit({
      ...this.setup,
      [location]: [
        ...this.setup[location].slice(0, itemIdx),
        {
          ...this.setup[location][itemIdx],
          fields: [
            ...this.setup[location][itemIdx].fields.slice(0, idx),
            ...this.setup[location][itemIdx].fields.slice(idx + 1)
          ]
        },
        ...this.setup[location].slice(itemIdx + 1)
      ]
    });
    this.labelMakerFacade.hasChanges(true);
  }

  fieldAdd(labelField: ILabelField): void {
    if (!labelField) {
      return;
    }
    const {itemIdx, location} = this.findItem();
    if (itemIdx === -1) {
      return;
    }
    this.setupChange.emit({
      ...this.setup,
      [location]: [
        ...this.setup[location].slice(0, itemIdx),
        {
          ...this.setup[location][itemIdx],
          fields: [
            ...this.setup[location][itemIdx].fields,
            labelField
          ]
        },
        ...this.setup[location].slice(itemIdx + 1)
      ]
    });
    this.labelMakerFacade.hasChanges(true);
  }

  fieldUpdate(labelField: ILabelField, idx: number): void {
    const {itemIdx, location} = this.findItem();
    if (itemIdx === -1) {
      return;
    }
    this.setupChange.emit({
      ...this.setup,
      [location]: [
        ...this.setup[location].slice(0, itemIdx),
        {
          ...this.setup[location][itemIdx],
          fields: [
            ...this.setup[location][itemIdx].fields.slice(0, idx),
            labelField,
            ...this.setup[location][itemIdx].fields.slice(idx + 1)
          ]
        },
        ...this.setup[location].slice(itemIdx + 1)
      ]
    });
    this.labelMakerFacade.hasChanges(true);
  }

  drop(event: CdkDragDrop<ILabelField[]>): void {
    const {itemIdx, location} = this.findItem();
    if (itemIdx === -1) {
      return;
    }
    const list = [...this._selectedLabelItem.fields];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.setupChange.emit({
      ...this.setup,
      [location]: [
        ...this.setup[location].slice(0, itemIdx),
        {
          ...this.setup[location][itemIdx],
          fields: list
        },
        ...this.setup[location].slice(itemIdx + 1)
      ]
    });
    this.labelMakerFacade.hasChanges(true);
  }

  round(value: any): number {
    return Math.round(value * 1000) / 1000;
  }

  changePosition(pos: keyof Pick<ILabelItem, 'x' | 'y'>, event: Event): void {
    const element = event.target as HTMLInputElement;
    const value = Number(element.value);
    if (!value) {
      return;
    }
    const dim = pos === 'x' ? 'width.mm' : 'height.mm';
    if (value + this._selectedLabelItem.style[dim] > this.setup.label[dim]) {
      element.value = '' + this._selectedLabelItem[pos];
      return alert(this.translateService.get('Field cannot fit the label!'));
    }
    this.changeSelectedItem(pos, value);
  }

  changeActiveStyle(style: string, event: Event): void {
    const element = event.target as HTMLInputElement;
    const value = Number(element.value);
    if (!value) {
      return;
    }
    const pos = style === 'width.mm' ? 'x' : 'y';
    if (value + this._selectedLabelItem[pos] > this.setup.label[style]) {
      element.value = this._selectedLabelItem.style[style];
      return alert(this.translateService.get('Field cannot fit the label!'));
    }

    this.changeSelectedItem('style', {
      ...this._selectedLabelItem.style,
      [style]: value
    });
  }

  private findItem(item?: ILabelItem): {location: TLabelLocation; itemIdx: number} {
    const labelItem = item || this._selectedLabelItem;
    let location: TLabelLocation = 'labelItems';
    let itemIdx = this.setup.labelItems.findIndex(i => i === labelItem);
    if (itemIdx === -1) {
      location = 'backSideLabelItems';
      itemIdx = (this.setup.backSideLabelItems || []).findIndex(i => i === labelItem);
    }
    return {location, itemIdx};
  }
}
