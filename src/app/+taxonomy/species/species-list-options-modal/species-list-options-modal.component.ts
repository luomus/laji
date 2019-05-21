import {Component, EventEmitter, Input, Output, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { TaxonomySearchQuery } from '../service/taxonomy-search-query';
import { ColumnSelector } from '../../../shared/columnselector/ColumnSelector';

@Component({
  selector: 'laji-species-list-options-modal',
  templateUrl: './species-list-options-modal.component.html',
  styleUrls: ['./species-list-options-modal.component.css']
})
export class SpeciesListOptionsModalComponent {
  @ViewChild('settingsModal') modalRef: ModalDirective;

  @Input() searchQuery: TaxonomySearchQuery;
  @Input() columnLookup: any;
  @Input() requiredFields: string[] = [];

  @Output() settingsChange = new EventEmitter();

  columnSelector = new ColumnSelector;

  constructor() { }

  clear() {
    this.columnSelector.columns = [...this.requiredFields];
  }

  openModal() {
    this.columnSelector.columns = [...this.searchQuery.listOptions.selected];

    this.modalRef.show();
  }

  closeOkModal() {
    if (this.columnSelector.hasChanges) {
      this.searchQuery.listOptions.selected = [...this.columnSelector.columns];
      this.settingsChange.emit();
    }

    this.modalRef.hide();
  }
}
