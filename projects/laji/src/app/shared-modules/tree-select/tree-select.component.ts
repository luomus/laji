import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { TreeSelectModalComponent } from './tree-select-modal/tree-select-modal.component';


export interface SelectedOption {
  id: string;
  value: string;
  type: 'included' | 'excluded';
}

export interface TreeOptionsNode {
  id: string;
  name: string;
  children?: TreeOptionsNode[];
  count?: number;
}

export interface TreeOptionsChangeEvent {
  selectedId?: string[];
  selectedIdNot?: string[];
}

@Component({
  selector: 'laji-tree-select',
  templateUrl: './tree-select.component.html',
  styleUrls: ['./tree-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeSelectComponent {
  @Input() includedOptions: string[] = [];
  @Input() excludedOptions: string[] = [];
  @Input() optionsTree$: Observable<TreeOptionsNode[]>;
  @Input() options$: Observable<SelectedOption[]>;
  @Input() modalButtonLabel: string;
  @Input() modalTitle: string;
  @Input() browseTitle: string;
  @Input() selectedTitle: string;
  @Input() okButtonLabel: string;
  @Input() clearButtonLabel: string;
  @Input() includeCount = false;
  @Input() includeLink = false;
  @Output() selectedOptionsChange = new EventEmitter<TreeOptionsChangeEvent>();

  lang: string;
  modalRef: BsModalRef;

  constructor(
    private modalService: BsModalService,
  ) {}

  openModal() {
    const initialState = {
      includedOptions: this.includedOptions,
      excludedOptions: this.excludedOptions,
      optionsTree$: this.optionsTree$,
      modalTitle: this.modalTitle,
      browseTitle: this.browseTitle,
      selectedTitle: this.selectedTitle,
      okButtonLabel: this.okButtonLabel,
      clearButtonLabel: this.clearButtonLabel,
      includeCount: this.includeCount,
      includeLink: this.includeLink,
    };
    this.modalRef = this.modalService.show(TreeSelectModalComponent, { class: 'modal-lg', initialState });
    this.modalRef.content.emitConfirm.subscribe(result => {
      this.selectedOptionsChange.emit(result);
    });
  }

  deselect(id: string) {
    if (this.includedOptions.includes(id)) {
      this.selectedOptionsChange.emit({
        selectedId: this.includedOptions.filter(option => option !== id),
        selectedIdNot: this.excludedOptions
      });
    } else if (this.excludedOptions.includes(id)) {
      this.selectedOptionsChange.emit({
        selectedId: this.includedOptions,
        selectedIdNot: this.excludedOptions.filter(option => option !== id)
      });
    }
  }
}
