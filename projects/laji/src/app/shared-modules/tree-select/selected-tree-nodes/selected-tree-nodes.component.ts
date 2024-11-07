import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CheckboxType } from '../../select/checkbox/checkbox.component';
import { SelectedOption } from '../tree-select.component';

@Component({
  selector: 'laji-selected-tree-nodes',
  template: `
     <div>
      <div *ngIf="included">
      <h6>{{ includedTitle }}</h6>
        <span class="lj-container" *ngFor="let option of included; trackBy: track">
          <label class="lj-item selected">
            <laji-checkbox [checkboxType]="checkboxType" [value]="getCheckboxValue(option.id)" (valueChange)="deselect(option.id)"></laji-checkbox> {{ option.value }}
          </label>
        </span>
      </div>
      <div *ngIf="excluded">
        <h6>{{ excludedTitle }}</h6>
        <span class="lj-container" *ngFor="let option of excluded; trackBy: track">
          <label class="lj-item selected">
            <laji-checkbox [checkboxType]="checkboxType" [value]="getCheckboxValue(option.id)" (valueChange)="deselect(option.id)"></laji-checkbox> {{ option.value }}
          </label>
        </span>
      </div>
    </div>
  `,
  styleUrls: ['./selected-tree-nodes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectedTreeNodesComponent implements OnChanges {
  @Input({required: true}) selectedOptions!: SelectedOption[];
  @Input({required: true}) includedTitle!: string;
  @Input({required: true}) excludedTitle!: string;
  @Output() selectedOptionsChange = new EventEmitter<string>();

  checkboxType = CheckboxType.excluded;

  excluded: SelectedOption[] = [];
  included: SelectedOption[] = [];

  ngOnChanges() {
    this.included = [];
    this.excluded = [];

    this.selectedOptions.forEach(option => {
      if (option.type === 'included') {
        this.included.push(option);
      } else {
        this.excluded.push(option);
      }
    });
  }

  track(idx: any, item: any) {
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
    return undefined;
  }

  deselect(id: string) {
    this.selectedOptionsChange.emit(id);
  }
}
