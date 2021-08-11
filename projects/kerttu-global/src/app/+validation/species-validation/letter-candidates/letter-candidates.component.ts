import { Component, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { ISpectrogramConfig, IAudioViewerRectangle, IAudioViewerArea } from 'projects/laji/src/app/shared-modules/audio-viewer/models';
import { IGlobalAudio, IKerttuLetterTemplate, IKerttuRecording } from '../../../kerttu-global-shared/models';

@Component({
  selector: 'laji-letter-candidates',
  templateUrl: './letter-candidates.component.html',
  styleUrls: ['./letter-candidates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LetterCandidatesComponent implements OnChanges {
  @Input() data: IKerttuRecording[];
  @Input() spectrogramConfig: ISpectrogramConfig;

  @Output() audioClick = new EventEmitter<IKerttuLetterTemplate>();

  rectanges: IAudioViewerRectangle[][] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data) {
      this.initRectangles();
    }
  }

  onAudioClick(audio: IGlobalAudio, area?: IAudioViewerArea) {
    this.audioClick.emit({'audioId': audio.id, area});
  }

  private initRectangles() {
    if (!this.data) {
      this.rectanges = [];
      return;
    }

    this.rectanges = this.data.map(item => {
      return (item.candidates || []).map((candidate, i) => {
        return {
          area: candidate,
          color: '#92c8ec',
          label: 'C' + (i + 1)
        };
      });
    });
  }
}
