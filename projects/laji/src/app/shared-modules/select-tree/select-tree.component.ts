import { Component, OnInit, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { ICollectionsTreeNode } from '../../shared/service/collection.service';
import { SelectTreeModalComponent } from './select-tree-modal/select-tree-modal.component';


export interface SelectedOption {
  id: any;
  value: any;
  type: 'included' | 'excluded';
}

@Component({
  selector: 'laji-select-tree',
  templateUrl: './select-tree.component.html',
  styleUrls: ['./select-tree.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectTreeComponent {
  @Input() includedOptions: string[] = [];
  @Input() excludedOptions: string[] = [];
  @Input() optionsTree$: Observable<ICollectionsTreeNode[]>;
  @Input() options$: Observable<SelectedOption[]>;
  @Input() modalButtonLabel: string;
  @Input() modalTitle: string;
  @Input() browseTitle: string;
  @Input() selectedTitle: string;
  @Input() okButtonLabel: string;
  @Input() clearButtonLabel: string;
  @Output() selectedOptionsChange = new EventEmitter<{
    selectedId?: string[],
    selectedIdNot?: string[],
  }>();

  lang: string;
  modalRef: BsModalRef;

  constructor (
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
    };
    this.modalRef = this.modalService.show(SelectTreeModalComponent, { class: 'modal-lg', initialState });
    this.modalRef.content.emitConfirm.subscribe(result => {
      this.selectedOptionsChange.emit(result);
    });
  }

  deselect(id: string) {
    if (this.includedOptions.includes(id)) {
      this.selectedOptionsChange.emit({ selectedId: this.includedOptions.filter(option => option !== id) });
    } else if (this.excludedOptions.includes(id)) {
      this.selectedOptionsChange.emit({ selectedIdNot: this.excludedOptions.filter(option => option !== id) });
    }
  }
}
