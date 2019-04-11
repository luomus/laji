import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { TaxonomySearchQuery } from '../service/taxonomy-search-query';

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

  _selected: string[] = [];
  hasChanges = false;

  constructor() { }

  clear() {
    this._selected = [...this.requiredFields];
  }

  toggleSelectedFields(fields: string[]) {
    fields.forEach(field => {
      this.toggleSelectedField(field);
    });
  }

  toggleSelectedField(field: string) {
    this.hasChanges = true;
    const idx = this._selected.indexOf(field);
    if (idx === -1) {
      this._selected = [...this._selected, field];
    } else {
      this._selected = [
        ...this._selected.slice(0, idx),
        ...this._selected.slice(idx + 1)
      ];
    }
  }

  openModal() {
    this._selected = [...this.searchQuery.listOptions.selected];
    this.hasChanges = false;
    this.modalRef.show();
  }

  closeOkModal() {
    if (this.hasChanges) {
      this.searchQuery.listOptions.selected = [...this._selected];
      this.settingsChange.emit();
    }

    this.modalRef.hide();
  }
}
