import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { SelectOption } from '../select-collections.component';

@Component({
  selector: 'laji-selected-collections',
  template: `
     <div>
      <span class="lj-container" *ngFor="let option of selectedOptions; trackBy: track">
        <label class="lj-item selected">
          <laji-checkbox [value]="true" (valueChange)="deselect(option.id)"></laji-checkbox> {{ option.value }}
        </label>
      </span>
    </div>
  `,
  styleUrls: ['./selected-collections.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectedCollectionsComponent {
  @Input() selectedOptions: SelectOption[];
  @Output() selectedOptionsChange = new EventEmitter<string>();

  track(idx, item) {
    return item.id;
  }

  deselect(id: string) {
    this.selectedOptionsChange.emit(id);
  }
}
