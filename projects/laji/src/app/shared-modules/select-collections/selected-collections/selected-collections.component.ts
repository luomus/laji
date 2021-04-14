import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CheckboxType } from '../../select/checkbox/checkbox.component';
import { SelectedOption } from '../select-collections.component';

@Component({
  selector: 'laji-selected-collections',
  template: `
     <div>
      <span class="lj-container" *ngFor="let option of selectedOptions; trackBy: track">
        <label class="lj-item selected">
          <laji-checkbox [checkboxType]="checkboxType" [value]="getCheckboxValue(option.id)" (valueChange)="deselect(option.id)"></laji-checkbox> {{ option.value }}
          {{ getCheckboxValue(option.id) }} {{ checkboxType }}
        </label>
      </span>
    </div>
  `,
  styleUrls: ['./selected-collections.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectedCollectionsComponent {
  @Input() selectedOptions: SelectedOption[];
  @Output() selectedOptionsChange = new EventEmitter<string>();

  checkboxType = CheckboxType.excluded;

  track(idx, item) {
    return item.id;
  }

  getCheckboxValue(id: string) {
    const selected = this.selectedOptions.find(option => option.id === id);

    if (!selected) {
      return undefined;
    }

    if (selected.type === 'included') {
      return true;
    } else if (selected.type === 'excluded') {
      return false;
    }
  }

  deselect(id: string) {
    this.selectedOptionsChange.emit(id);
  }
}
