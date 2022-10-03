import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output, OnInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
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
  quality?: string;
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

export class TreeSelectComponent implements OnInit {
  @Input() includedOptions: string[] = [];
  @Input() excludedOptions: string[] = [];
  @Input() optionsTree$: Observable<TreeOptionsNode[]>;
  @Input() options$: Observable<SelectedOption[]>;
  @Input() modalButtonLabel: string;
  @Input() modalTitle: string;
  @Input() browseTitle: string;
  @Input() selectedTitle: string;
  @Input() includedTitle: string;
  @Input() excludedTitle: string;
  @Input() okButtonLabel: string;
  @Input() clearButtonLabel: string;
  @Input() includeCount = false;
  @Input() includeLink = false;
  @Output() selectedOptionsChange = new EventEmitter<TreeOptionsChangeEvent>();

  lang: string;
  modalRef: BsModalRef;
  options: SelectedOption[];

  constructor(
    private modalService: BsModalService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.options$.subscribe(data => {
      this.options = data;

      this.cd.markForCheck();
    });
  }

  openModal() {
    const initialState = {
      selectedOptions: this.options,
      optionsTree$: this.optionsTree$,
      modalTitle: this.modalTitle,
      browseTitle: this.browseTitle,
      selectedTitle: this.selectedTitle,
      includedTitle: this.includedTitle,
      excludedTitle: this.excludedTitle,
      okButtonLabel: this.okButtonLabel,
      clearButtonLabel: this.clearButtonLabel,
      includeCount: this.includeCount,
      includeLink: this.includeLink,
    };
    this.modalRef = this.modalService.show(TreeSelectModalComponent, { class: 'modal-lg', initialState });
    this.modalRef.content.emitConfirm.subscribe(result => {
      const includeToReturn = [];
      const excludeToReturn = [];

      this.options = result;

      result.forEach(option => {
        if (option.type === 'included') {
          includeToReturn.push(option.id);
        } else if (option.type === 'excluded') {
          excludeToReturn.push(option.id);
        }
      });

      this.selectedOptionsChange.emit({
        selectedId: includeToReturn,
        selectedIdNot: excludeToReturn,
      });
    });
  }

  deselect(id: string) {
    this.options = this.options.filter(option => id !== option.id);

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
