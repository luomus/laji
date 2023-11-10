import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { TaxonomySearchQuery } from '../service/taxonomy-search-query';
import { ColumnSelector } from '../../../shared/columnselector/ColumnSelector';
import { TaxonomyColumns } from '../service/taxonomy-columns';
import { ModalComponent } from 'projects/laji-ui/src/lib/modal/modal/modal.component';

@Component({
  selector: 'laji-species-list-options-modal',
  templateUrl: './species-list-options-modal.component.html',
  styleUrls: ['./species-list-options-modal.component.css']
})
export class SpeciesListOptionsModalComponent {
  @ViewChild('settingsModal', { static: true }) modalRef: ModalComponent;

  @Input() searchQuery: TaxonomySearchQuery;
  @Input() requiredFields: string[] = [];

  @Output() settingsChange = new EventEmitter();

  columnSelector = new ColumnSelector();

  constructor(
    public columnService: TaxonomyColumns
  ) { }

  clear() {
    this.columnSelector.columns = [...this.requiredFields];
  }

  resetFields() {
    this.searchQuery.resetFields();
    this.columnSelector.columns = [...this.searchQuery.listOptions.selected];
    this.settingsChange.emit();
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
