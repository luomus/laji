import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { ISpectrogramConfig } from 'projects/laji/src/app/shared-modules/audio-viewer/models';
import { IGlobalAudio, IKerttuLetterTemplate, IKerttuRecording } from '../../../kerttu-global-shared/models';

@Component({
  selector: 'laji-species-template-validation',
  templateUrl: './species-template-validation.component.html',
  styleUrls: ['./species-template-validation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesTemplateValidationComponent implements OnChanges {
  @Input() data?: IKerttuRecording[];
  @Input() templates?: IKerttuLetterTemplate[];

  showCandidates = false;
  candidatesLoaded = false;

  spectrogramConfig: ISpectrogramConfig = {
    sampleRate: 32000,
    nperseg: 512,
    noverlap: 192,
    nbrOfRowsRemovedFromStart: 0
  };

  activeTemplate: IKerttuLetterTemplate;
  activeTemplateIdx: number;
  activeTemplateIsNew: boolean;

  audioIdMap: {[id: number]: IGlobalAudio } = {};

  @Output() save = new EventEmitter<IKerttuLetterTemplate[]>();

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      this.audioIdMap = {};
      (this.data || []).map(d => {
        this.audioIdMap[d.audio.id] = d.audio;
      });
    }
    if (changes.templates && this.templates) {
      this.setShowCandidates(this.templates.indexOf(null) !== -1);
    }
  }

  onAudioClick(template: IKerttuLetterTemplate) {
    const newTemplateIdx = this.templates.indexOf(null);
    if (this.activeTemplateIdx === -1) {
      // alert
    } else {
      this.activeTemplate = template;
      this.activeTemplateIdx = newTemplateIdx;
      this.activeTemplateIsNew = true;
    }
  }

  onTemplateClick(templateIdx: number) {
    this.activeTemplate = this.templates[templateIdx];
    this.activeTemplateIdx = templateIdx;
    this.activeTemplateIsNew = false;
  }

  onTemplateConfirm(template: IKerttuLetterTemplate) {
    this.templates[this.activeTemplateIdx] = template;
    this.activeTemplate = null;
  }

  setShowCandidates(value: boolean) {
    this.showCandidates = value;
    if (this.showCandidates) {
      this.candidatesLoaded = true;
    }
  }
}
