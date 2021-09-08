import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { AudioViewerMode, IAudioViewerArea, ISpectrogramConfig } from 'projects/laji/src/app/shared-modules/audio-viewer/models';
import { IGlobalAudio, IKerttuLetterTemplate } from '../../../kerttu-global-shared/models';

@Component({
  selector: 'laji-letter-template',
  templateUrl: './letter-template.component.html',
  styleUrls: ['./letter-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LetterTemplateComponent {
  @Input() template: IKerttuLetterTemplate;
  @Input() audio: IGlobalAudio;
  @Input() spectrogramConfig: ISpectrogramConfig;
  @Input() templateIdx: number;
  @Input() isNew: boolean;
  @Input() focusTime: number;

  @Output() confirm = new EventEmitter<IKerttuLetterTemplate>();
  @Output() cancel = new EventEmitter();
  @Output() remove = new EventEmitter();

  audioViewerMode: AudioViewerMode = 'default';
  defaultZoomFrequency = true;
  zoomFrequency = this.defaultZoomFrequency;
  defaultTimePadding = 30;
  timePadding = this.defaultTimePadding;

  toggleDrawMode() {
    this.audioViewerMode = this.audioViewerMode === 'draw' ? 'default' : 'draw';
  }

  onDrawEnd(area: IAudioViewerArea) {
    if (!this.template) {
      this.template = {
        audioId: this.audio.id,
        area: area
      };
    } else {
      this.template.area = area;
    }
    this.audioViewerMode = 'default';
  }
}
