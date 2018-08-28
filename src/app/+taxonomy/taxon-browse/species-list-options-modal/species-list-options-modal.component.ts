import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { UserService } from '../../../shared/service/user.service';
import { TaxonomySearchQuery } from '../service/taxonomy-search-query';

@Component({
  selector: 'laji-species-list-options-modal',
  templateUrl: './species-list-options-modal.component.html',
  styleUrls: ['./species-list-options-modal.component.css']
})
export class SpeciesListOptionsModalComponent implements OnInit {
  @ViewChild('settingsModal') modalRef: ModalDirective;

  @Input() searchQuery: TaxonomySearchQuery;
  @Input() columnLookup: any;
  @Input() requiredFields: string[] = [];
  @Input() listType: 'list'|'tree';

  private optionsKey: string;
  private storeKey: string;

  @Output() close = new EventEmitter();
  @Output() settingsLoaded = new EventEmitter();

  _selected: string[] = [];

  constructor(
    private userService: UserService
  ) { }

  ngOnInit() {
    if (this.listType === 'list') {
      this.optionsKey = 'listOptions';
      this.storeKey = UserService.SETTINGS_TAXONOMY_LIST;
    } else {
      this.optionsKey = 'treeOptions';
      this.storeKey = UserService.SETTINGS_TAXONOMY_TREE;
    }

    this.userService.getItem<any>(this.storeKey)
      .subscribe(data => {
        if (data && data.selected) {
          this.searchQuery[this.optionsKey].selected = data.selected;
        }
        this.settingsLoaded.emit();
      });
  }

  clear() {
    this._selected = [...this.requiredFields]
  }

  toggleSelectedField(field: string) {
    const idx = this._selected.indexOf(field);
    if (idx === -1) {
      this._selected = [...this._selected, field];
    } else {
      this._selected = [
        ...this._selected.slice(0, idx),
        ...this._selected.slice(idx + 1)
      ]
    }
  }

  openModal() {
    this._selected = [...this.searchQuery[this.optionsKey].selected];
    this.modalRef.show();
  }

  closeOkModal() {
    this.searchQuery[this.optionsKey].selected = [...this._selected];
    this.saveSettings();
    this.close.emit();
    this.modalRef.hide();
  }

  private saveSettings() {
    this.userService.setItem(this.storeKey, {
      selected: this.searchQuery[this.optionsKey].selected
    }).subscribe(() => {}, () => {});
  }
}
