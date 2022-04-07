import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ISpectrogramConfig } from 'projects/laji/src/app/shared-modules/audio-viewer/models';
import { DialogService } from 'projects/laji/src/app/shared/service/dialog.service';
import { IGlobalAudio, IGlobalTemplate, IGlobalRecording, IGlobalComment, IGlobalSpecies } from '../../../kerttu-global-shared/models';

@Component({
  selector: 'bsg-species-template-validation',
  templateUrl: './species-template-validation.component.html',
  styleUrls: ['./species-template-validation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesTemplateValidationComponent implements OnChanges {
  @Input() species?: IGlobalSpecies;
  @Input() recordings?: IGlobalRecording[];
  @Input() templates?: IGlobalTemplate[];
  @Input() saving = false;
  @Input() historyView = false;
  @Input() spectrogramConfig: ISpectrogramConfig;

  hasAllTemplatesInitially = false;
  showCandidates = false;

  confirmedTemplates: boolean[] = [];
  comments: IGlobalComment[] = [];
  creatingAllTemplatesIsNotPossible = false;

  activeTemplateIdx?: number;
  activeTemplate?: IGlobalTemplate;
  activeTemplateIsNew?: boolean;
  activeAudio?: IGlobalAudio;
  activeAudioFocusTime?: number;

  audioIdMap: {[id: number]: IGlobalAudio } = {};
  subSpecies: IGlobalSpecies[] = [];

  @Output() save = new EventEmitter<{ templates: IGlobalTemplate[]; comments: IGlobalComment[] }>();
  @Output() cancel = new EventEmitter();

  constructor(
    private translate: TranslateService,
    private dialogService: DialogService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.recordings) {
      this.audioIdMap = {};
      (this.recordings || []).map(d => {
        this.audioIdMap[d.audio.id] = d.audio;
      });

      const addedSubSpecies = [];
      this.subSpecies = (this.recordings || []).reduce((subSpecies, d) => {
        const species = d.audio.species;
        if (!species.isSpecies && !addedSubSpecies.includes(species.id)) {
          subSpecies.push(species);
          addedSubSpecies.push(species.id);
        }
        return subSpecies;
      }, []);
      this.subSpecies = this.subSpecies.sort((a, b) => b.taxonOrder - a.taxonOrder);
    }

    if (changes.templates && this.templates) {
      this.hasAllTemplatesInitially = this.templates.indexOf(null) === -1;
      if (!this.hasAllTemplatesInitially && !this.historyView) {
        this.confirmAllTemplates();
      }

      if (changes.templates.previousValue == null) {
        this.setShowCandidates(!this.hasAllTemplatesInitially);
      }
      if (this.activeTemplateIdx != null) {
        this.onTemplateClick(this.activeTemplateIdx);
      }
    }
  }

  onAudioClick(data: { audioId: number; time: number }) {
    this.onNewTemplateClick(data.audioId, null, data.time);
  }

  onCandidateClick(template: IGlobalTemplate) {
    this.onNewTemplateClick(template.audioId, template);
  }

  onTemplateClick(templateIdx: number) {
    if (this.saving) {
      return;
    }
    this.activeTemplate = this.templates[templateIdx];
    this.activeAudio = this.audioIdMap[this.activeTemplate?.audioId];
    this.activeTemplateIdx = templateIdx;
    this.activeTemplateIsNew = false;
  }

  onTemplateConfirm(template: IGlobalTemplate) {
    this.templates[this.activeTemplateIdx] = template;
    this.confirmedTemplates[this.activeTemplateIdx] = true;
    this.activeTemplateIdx = null;
  }

  onTemplateCancel() {
    this.activeTemplateIdx = null;
  }

  onTemplateRemove() {
    this.templates[this.activeTemplateIdx] = null;
    this.confirmedTemplates[this.activeTemplateIdx] = false;
    this.activeTemplateIdx = null;
  }

  onComment(comment: IGlobalComment) {
    this.comments.push(comment);
  }

  setShowCandidates(value: boolean) {
    this.showCandidates = value;
  }

  confirmAllTemplates() {
    this.confirmedTemplates = this.templates.map(template => !!template);
  }

  saveTemplates() {
    const missingConfirm = this.confirmedTemplates.filter(confirm => !!confirm).length !== this.templates.length;

    if (missingConfirm && !(!this.hasAllTemplatesInitially && this.creatingAllTemplatesIsNotPossible)) {
      this.dialogService.alert(
        this.translate.instant(this.hasAllTemplatesInitially ? 'validation.missingConfirm' : 'validation.missingTemplates')
      );
      return;
    }

    this.save.emit({
      templates: this.templates,
      comments: this.comments
    });
  }

  private onNewTemplateClick(audioId: number, template?: IGlobalTemplate, time?: number) {
    if (this.saving || this.historyView) {
      return;
    }
    const newTemplateIdx = this.templates.indexOf(null);
    if (newTemplateIdx === -1) {
      this.dialogService.alert('validation.maxNbrOfTemplates');
    } else {
      this.activeTemplateIdx = newTemplateIdx;
      this.activeTemplate = template;
      this.activeTemplateIsNew = true;
      this.activeAudio = this.audioIdMap[audioId];
      this.activeAudioFocusTime = time;
    }
  }
}
