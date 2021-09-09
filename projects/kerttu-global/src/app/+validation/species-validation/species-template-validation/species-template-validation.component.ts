import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ISpectrogramConfig } from 'projects/laji/src/app/shared-modules/audio-viewer/models';
import { DialogService } from 'projects/laji/src/app/shared/service/dialog.service';
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
  @Input() saving = false;

  hasInitialTemplates = false;

  showCandidates = false;
  candidatesLoaded = false;

  confirmedTemplates = [];

  spectrogramConfig: ISpectrogramConfig = {
    sampleRate: 32000,
    nperseg: 512,
    noverlap: 192,
    nbrOfRowsRemovedFromStart: 0
  };

  activeTemplateIdx: number;
  activeTemplate: IKerttuLetterTemplate;
  activeTemplateIsNew: boolean;
  activeAudio: IGlobalAudio;
  focusTime: number;

  audioIdMap: {[id: number]: IGlobalAudio } = {};

  @Output() save = new EventEmitter<IKerttuLetterTemplate[]>();
  @Output() cancel = new EventEmitter();

  constructor(
    private translate: TranslateService,
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      this.audioIdMap = {};
      (this.data || []).map(d => {
        this.audioIdMap[d.audio.id] = d.audio;
      });
    }
    if (changes.templates && this.templates) {
      this.confirmedTemplates = this.templates.map(() => false);
      this.hasInitialTemplates = this.templates.indexOf(null) === -1;
      this.setShowCandidates(!this.hasInitialTemplates);
    }
  }

  onAudioClick(data: { audioId: number, time: number }) {
    this.onNewTemplateClick(data.audioId, null, data.time);
  }

  onCandidateClick(template: IKerttuLetterTemplate) {
    this.onNewTemplateClick(template.audioId, template);
  }

  onTemplateClick(templateIdx: number) {
    if (this.saving) {
      return;
    }
    this.activeTemplate = this.templates[templateIdx];
    this.activeAudio = this.audioIdMap[this.activeTemplate.audioId];
    this.activeTemplateIdx = templateIdx;
    this.activeTemplateIsNew = false;
  }

  onTemplateConfirm(template: IKerttuLetterTemplate) {
    this.templates[this.activeTemplateIdx] = template;
    this.confirmedTemplates[this.activeTemplateIdx] = true;
    this.activeTemplateIdx = null;
  }

  onTemplateCancel() {
    this.activeTemplateIdx = null;
  }

  onTemplateRemove() {
    this.dialogService.confirm('validation.templates.remove.confirm').subscribe(confirm => {
      if (confirm) {
        this.templates[this.activeTemplateIdx] = null;
        this.confirmedTemplates[this.activeTemplateIdx] = false;
        this.activeTemplateIdx = null;
        this.cdr.markForCheck();
      }
    });
  }

  setShowCandidates(value: boolean) {
    this.showCandidates = value;
    if (this.showCandidates) {
      this.candidatesLoaded = true;
    }
  }

  confirmAllTemplates() {
    this.confirmedTemplates = this.templates.map(template => !!template);
  }

  saveTemplates() {
    const missingConfirm = this.confirmedTemplates.indexOf(false) !== -1;
    if (missingConfirm) {
      this.dialogService.alert(
        this.translate.instant(this.hasInitialTemplates ? 'validation.missingConfirm' : 'validation.missingTemplates')
      );
      return;
    }

    this.save.emit(this.templates);
  }

  private onNewTemplateClick(audioId: number, template?: IKerttuLetterTemplate, time?: number) {
    if (this.saving) {
      return;
    }
    const newTemplateIdx = this.templates.indexOf(null);
    if (newTemplateIdx === -1) {
      this.dialogService.alert('validation.templates.maxNbrOfTemplates');
    } else {
      this.activeTemplateIdx = newTemplateIdx;
      this.activeTemplate = template;
      this.activeTemplateIsNew = true;
      this.activeAudio = this.audioIdMap[audioId];
      this.focusTime = time;
    }
  }
}
