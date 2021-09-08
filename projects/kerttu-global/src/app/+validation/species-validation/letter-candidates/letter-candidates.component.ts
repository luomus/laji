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
  @Input() templates: IKerttuLetterTemplate[];

  @Output() audioClick = new EventEmitter<IKerttuLetterTemplate>();

  rectanges: IAudioViewerRectangle[][] = [];

  audioLoadingLimit = 0;
  private maxLoadingAtTheSameTime = 5;

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data || changes.templates) {
      if (changes.data) {
        this.audioLoadingLimit = this.maxLoadingAtTheSameTime;
      }
      this.initRectangles();
    }
  }

  onAudioClick(audio: IGlobalAudio, area?: IAudioViewerArea) {
    this.audioClick.emit({'audioId': audio.id, area});
  }

  onAudioLoadingChange(loading: boolean) {
    if (!loading) {
      this.audioLoadingLimit += 1;
    }
  }

  private initRectangles() {
    if (!this.data) {
      this.rectanges = [];
      return;
    }

    this.rectanges = this.data.map(item => {
      const candidates = (item.candidates || []).map((candidate, i) => {
        return {
          area: candidate,
          color: '#26bed9',
          label: 'C' + (i + 1)
        };
      });

      const templates = (this.templates || []).reduce((result, template, i) => {
        if (template?.audioId === item.audio.id) {
          result.push({
            area: template.area,
            color: '#d98026',
            label: 'T' + (i + 1)
          });
        }
        return result;
      }, []);

      return candidates.concat(templates);
    });
  }
}
