import { Component, Input, ViewChild, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { ModalService } from 'projects/laji-ui/src/lib/modal/modal.service';
import { Observable } from 'rxjs';
import { TreeOptionsNode, SelectedOption } from '../tree-select.component';
import { TreeSelectorComponent } from '../tree-selector/tree-selector.component';

@Component({
  selector: 'laji-tree-select-modal',
  templateUrl: './tree-select-modal.component.html',
  styleUrls: ['./tree-select-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TreeSelectModalComponent {
  @Input({required: true}) selectedOptions!: SelectedOption[];
  @Input({required: true}) optionsTree$!: Observable<TreeOptionsNode[]>;
  @Input({required: true}) modalTitle!: string;
  @Input({required: true}) browseTitle!: string;
  @Input({required: true}) selectedTitle!: string;
  @Input({required: true}) includedTitle!: string;
  @Input({required: true}) excludedTitle!: string;
  @Input({required: true}) okButtonLabel!: string;
  @Input({required: true}) clearButtonLabel!: string;
  @Input() includeCount = false;
  @Input() includeLink = false;
  @Input() useVirtualScroll = true;
  @ViewChild('treeSelector')
  treeSelectorComponent!: TreeSelectorComponent;
  @Output() emitConfirm = new EventEmitter<SelectedOption[]>();

  constructor(
    private modalService: ModalService,
  ) { }

  deselect(id: string) {
    this.treeSelectorComponent.deselect(id);
  }

  clear() {
    this.treeSelectorComponent.clear();
  }

  changeSelected(newSelected: SelectedOption[]) {
    this.selectedOptions = newSelected;
  }

  confirm() {
    this.emitConfirm.emit(this.selectedOptions);
  }
}
