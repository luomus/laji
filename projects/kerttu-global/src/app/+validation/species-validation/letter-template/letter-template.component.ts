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

  @Output() confirm = new EventEmitter<IKerttuLetterTemplate>();

  audioViewerMode: AudioViewerMode = 'default';

  toggleDrawMode() {
    this.audioViewerMode = this.audioViewerMode === 'draw' ? 'default' : 'draw';
  }

  onDrawEnd(area: IAudioViewerArea) {
    this.template.area = area;
    this.audioViewerMode = 'default';
  }
}
