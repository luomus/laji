import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { TreeSelectModalComponent } from './tree-select-modal/tree-select-modal.component';
import { Util } from '../../shared/service/util.service';
import { ModalRef, ModalService } from 'projects/laji-ui/src/lib/modal/modal.service';
import { PlatformService } from '../../root/platform.service';

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

export class TreeSelectComponent {
  @Input() includedOptions: string[] = [];
  @Input() excludedOptions: string[] = [];
  @Input() optionsTree$!: Observable<TreeOptionsNode[]>;
  @Input() options!: SelectedOption[];
  @Input() modalButtonLabel!: string;
  @Input() modalTitle!: string;
  @Input() browseTitle!: string;
  @Input() selectedTitle!: string;
  @Input() includedTitle!: string;
  @Input() excludedTitle!: string;
  @Input() okButtonLabel!: string;
  @Input() clearButtonLabel!: string;
  @Input() includeCount = false;
  @Input() includeLink = false;
  @Output() selectedOptionsChange = new EventEmitter<TreeOptionsChangeEvent>();

  lang!: string;
  modalRef!: ModalRef<TreeSelectModalComponent>;

  constructor(
    private modalService: ModalService,
  ) {}

  openModal() {
    const initialState = {
      selectedOptions: (this.options || []),
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
    this.modalRef = this.modalService.show(TreeSelectModalComponent, { size: 'lg', contentClass: 'tree-select-modal-content', initialState });
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.modalRef.content!.emitConfirm.subscribe(result => {
      this.modalRef.hide();
      const includeToReturn: string[] = [];
      const excludeToReturn: string[] = [];

      this.options = result;

      result.forEach(option => {
        if (option.type === 'included') {
          includeToReturn.push(option.id);
        } else if (option.type === 'excluded') {
          excludeToReturn.push(option.id);
        }
      });

      if (!Util.equalsArray(this.includedOptions, includeToReturn) || !Util.equalsArray(this.excludedOptions, excludeToReturn)) {
        this.selectedOptionsChange.emit({
          selectedId: includeToReturn,
          selectedIdNot: excludeToReturn,
        });
      }
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
