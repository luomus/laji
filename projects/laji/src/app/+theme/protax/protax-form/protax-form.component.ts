import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { ProtaxModelEnum } from '../models';
import { DialogService } from '../../../shared/service/dialog.service';
import { toHtmlInputElement } from '../../../shared/service/html-element.service';

enum Tab {
  textArea,
  fileSelect
}

@Component({
  selector: 'laji-protax-form',
  templateUrl: './protax-form.component.html',
  styleUrls: ['./protax-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtaxFormComponent implements OnChanges {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Input() loading = false;
  @Input() downloadProgress!: number;

  model: ProtaxModelEnum = ProtaxModelEnum.COIFull;
  probabilityThreshold = 0.1;
  minimumOverlap = 100;

  sequenceData: string | undefined;
  sequenceFile: File | undefined | null;

  activeTab = Tab.textArea;

  protaxModels = ProtaxModelEnum;
  toHtmlInputElement = toHtmlInputElement;

  @Output() protaxSubmit = new EventEmitter<FormData>();

  constructor(
    private dialogService: DialogService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.loading && changes.loading.previousValue) {
      this.fileInput.nativeElement.value = '';
    }
  }

  updateSequenceFile(files: FileList) {
    this.sequenceFile = files.item(0);
  }

  submitForm() {
    if (this.probabilityThreshold == null || this.probabilityThreshold < 0 || this.probabilityThreshold > 1) {
      this.dialogService.alert('theme.protax.invalidThreshold');
      return;
    }
    if (this.minimumOverlap == null || this.minimumOverlap < 1 || this.minimumOverlap > 500) {
      this.dialogService.alert('theme.protax.invalidMinimumOverlap');
      return;
    }
    if ((this.activeTab === Tab.textArea && !this.sequenceData) || (this.activeTab === Tab.fileSelect && !this.sequenceFile)) {
      this.dialogService.alert('theme.protax.noSequence');
      return;
    }

    this.protaxSubmit.emit(this.getFormData());
  }

  private getFormData(): FormData {
    const formData = new FormData();

    let sequenceData: Blob;
    if (this.activeTab === Tab.textArea) {
      sequenceData = new Blob([<BlobPart><unknown>this.sequenceData],
        { type: 'text/plain;charset=utf-8' });
    } else {
      sequenceData = <Blob><unknown>this.sequenceFile;
    }

    formData.append('data', sequenceData, 'input_data.fa');
    formData.append('model', this.model);
    formData.append('probabilityThreshold', this.probabilityThreshold.toString());
    formData.append('minimumOverlap', this.minimumOverlap.toString());
    return formData;
  }
}
