import { Component, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { ISpectrogramConfig, IAudioViewerRectangle, IAudioViewerArea } from 'projects/laji/src/app/shared-modules/audio-viewer/models';
import { IGlobalAudio, IGlobalTemplate, IGlobalRecording } from '../../../../kerttu-global-shared/models';

@Component({
  selector: 'bsg-recordings',
  templateUrl: './recordings.component.html',
  styleUrls: ['./recordings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordingsComponent implements OnChanges {
  @Input() recordings: IGlobalRecording[] = [];
  @Input() templates: IGlobalTemplate[] = [];
  @Input() spectrogramConfig?: ISpectrogramConfig;

  @Output() audioClick = new EventEmitter<{audioId: number, time: number}>();
  @Output() candidateClick = new EventEmitter<IGlobalTemplate>();

  rectangles: IAudioViewerRectangle[][] = [];

  audioLoadingLimit = 0;
  private maxLoadingAtTheSameTime = 5;

  ngOnChanges(changes: SimpleChanges) {
    if (changes.recordings || changes.templates) {
      if (changes.recordings) {
        this.audioLoadingLimit = this.maxLoadingAtTheSameTime;
      }
      this.initRectangles();
    }
  }

  onAudioClick(audio: IGlobalAudio, time: number) {
    this.audioClick.emit({'audioId': audio.id, time});
  }

  onCandidateClick(audio: IGlobalAudio, area: IAudioViewerArea) {
    this.candidateClick.emit({'audioId': audio.id, area});
  }

  onAudioLoadingChange(loading: boolean) {
    if (!loading) {
      this.audioLoadingLimit += 1;
    }
  }

  private initRectangles() {
    this.rectangles = (this.recordings || []).map(recording => {
      const candidates = (recording.candidates || []).map((candidate, i) => {
        return {
          area: candidate,
          color: '#26bed9',
          label: 'C' + (i + 1)
        };
      });

      const templates = (this.templates || []).reduce((result, template, i) => {
        if (template?.audioId === recording.audio.id) {
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
