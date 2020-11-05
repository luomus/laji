import {Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter} from '@angular/core';
import {ProtaxModelEnum} from '../models';
import { TranslateService } from '@ngx-translate/core';

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
export class ProtaxFormComponent implements OnInit {
  model: ProtaxModelEnum = ProtaxModelEnum.COIFull;
  probabilityThreshold = 0.1;

  sequenceData: string;
  sequenceFile: File;

  activeTab = Tab.textArea;

  protaxModels = ProtaxModelEnum;

  @Output() submit = new EventEmitter<FormData>();

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() {
  }

  updateSequenceFile(files: FileList) {
    this.sequenceFile = files.item(0);
  }

  submitForm() {
    if ((this.activeTab === Tab.textArea && !this.sequenceData) || (this.activeTab === Tab.fileSelect && !this.sequenceFile)) {
      alert(this.translate.instant('theme.protax.noSequence'));
      return;
    }

    this.submit.emit(this.getFormData());
  }

  private getFormData(): FormData {
    const formData = new FormData();

    let sequenceData: Blob;
    if (this.activeTab === Tab.textArea) {
      sequenceData = new Blob([this.sequenceData],
        { type: 'text/plain;charset=utf-8' });
    } else {
      sequenceData = this.sequenceFile;
    }

    formData.append('data', sequenceData, 'input_data.fa');
    formData.append('model', this.model);
    formData.append('probabilityThreshold', this.probabilityThreshold.toString());
    return formData;
  }
}
