import { Component, Input, OnInit, ViewChild, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Observable, Subject } from 'rxjs';
import { TreeOptionsNode, SelectedOption } from '../tree-select.component';
import { TreeSelectorComponent } from '../tree-selector/tree-selector.component';

@Component({
  selector: 'laji-tree-select-modal',
  templateUrl: './tree-select-modal.component.html',
  styleUrls: ['./tree-select-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TreeSelectModalComponent {
  @Input() selectedOptions$: SelectedOption[];
  @Input() optionsTree$: Observable<TreeOptionsNode[]>;
  @Input() modalTitle: string;
  @Input() browseTitle: string;
  @Input() selectedTitle: string;
  @Input() includedTitle: string;
  @Input() excludedTitle: string;
  @Input() okButtonLabel: string;
  @Input() clearButtonLabel: string;
  @Input() includeCount: boolean;
  @Input() includeLink: boolean;
  @ViewChild('treeSelector') treeSelectorComponent: TreeSelectorComponent;
  @Output() emitConfirm = new EventEmitter<SelectedOption[]>();

  selectedOptions: SelectedOption[];

  constructor(
    private modalRef: BsModalRef,
  ) { }

  deselect(id: string) {
    this.treeSelectorComponent.deselect(id);
  }

  close() {
    this.modalRef.hide();
  }

  clear() {
    this.treeSelectorComponent.clear();
  }

  changeSelected(newSelected: SelectedOption[]) {
    this.selectedOptions = newSelected;
  }

  confirm() {
    this.modalRef.hide();

    this.emitConfirm.emit(this.selectedOptions);
  }
}
