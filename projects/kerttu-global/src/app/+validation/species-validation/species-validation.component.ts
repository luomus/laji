import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ISpectrogramConfig } from 'projects/laji/src/app/shared-modules/audio-viewer/models';
import { IKerttuLetterTemplate, IKerttuRecording } from '../../kerttu-global-shared/models';

@Component({
  selector: 'laji-species-validation',
  templateUrl: './species-validation.component.html',
  styleUrls: ['./species-validation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeciesValidationComponent {
  @Input() data?: IKerttuRecording[];
  @Input() templates?: IKerttuLetterTemplate[];

  spectrogramConfig: ISpectrogramConfig = {
    sampleRate: 32000,
    nperseg: 512,
    noverlap: 192,
    nbrOfRowsRemovedFromStart: 0
  };

  activeTemplate: IKerttuLetterTemplate;
  activeTemplateIdx: number;
  activeTemplateIsNew: boolean;

  constructor() { }

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
}
