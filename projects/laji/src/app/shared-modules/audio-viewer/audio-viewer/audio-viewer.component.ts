import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { AudioService } from '../service/audio.service';
import { Subscription } from 'rxjs';
import { AudioViewerMode, IAudioViewerArea } from '../models';
import { AudioPlayer } from '../service/audio-player';
import { AudioViewerUtils } from '../service/audio-viewer-utils';
import { IAudio } from '../../../+theme/kerttu/models';
import { IGlobalAudio } from 'projects/kerttu-global/src/app/kerttu-global-shared/models';

function isAudio(audio: IAudio|IGlobalAudio): audio is IAudio {
  return !(audio as any).assetId;
}
function isGlobalAudio(audio: IAudio|IGlobalAudio): audio is IGlobalAudio {
  return !!(audio as any).assetId;
}

@Component({
  selector: 'laji-audio-viewer',
  templateUrl: './audio-viewer.component.html',
  styleUrls: ['./audio-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioViewerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() audio: IAudio|IGlobalAudio;

  @Input() focusArea: IAudioViewerArea; // focus area is drawn with white rectangle to the spectrogram
  @Input() focusAreaTimePadding: number; // how much recording is shown outside the focus area (if undefined the whole recording is shown)
  @Input() zoomFrequency = false;

  @Input() autoplay = false;
  @Input() autoplayRepeat = 1;

  @Input() highlightFocusArea = false; // highlighting darkens the spectrogram background and allows to play the sound only in the focus area
  @Input() showZoomControl = false; // zoom control allows the user to zoom into spectrogram

  // actual duration of the audio
  @Input() duration = 60;

  // spectrogram config
  @Input() sampleRate = 22050;
  @Input() nperseg = 256;
  @Input() noverlap = 256 - 160;
  @Input() nbrOfRowsRemovedFromStart = 2;

  @Input() mode: AudioViewerMode = 'default';

  localFocusArea: IAudioViewerArea; // focus area in extracted audio
  localZoomArea: IAudioViewerArea; // zoom area in extracted audio

  buffer: AudioBuffer;
  extractedBuffer: AudioBuffer;
  audioPlayer: AudioPlayer;

  loading = false;
  hasError = false;

  isAudio = isAudio;
  isGlobalAudio = isGlobalAudio;

  @Output() audioLoading = new EventEmitter<boolean>();
  @Output() drawEnd = new EventEmitter<IAudioViewerArea>();

  private extractedStartX = 0;
  private audioSub: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private audioService: AudioService,
    private ngZone: NgZone
  ) {
    this.audioPlayer = new AudioPlayer(this.audioService, this.ngZone, this.cdr);
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.audio) {
      this.clear();
      this.setAudioLoading(true);

      if (this.audio) {
        this.audioSub = this.audioService.getAudioBuffer(this.audio.url).subscribe((buffer) => {
          if (!this.areaIsValid(buffer, this.focusArea)) {
            this.onError();
            return;
          }
          this.buffer = buffer;
          this.setBuffer(buffer);

          if (this.autoplay) {
            this.audioPlayer.startAutoplay(this.autoplayRepeat);
          }

          this.cdr.markForCheck();
        }, () => {
          this.onError();
        });
      }
    } else if (!this.hasError) {
      if (changes.focusArea || changes.focusAreaTimePadding) {
        this.setAudioLoading(true);
        this.setBuffer(this.buffer);
      } else if (changes.zoomFrequency || changes.highlightFocusArea) {
        this.audioPlayer.setPlayArea(this.getPlayArea());
      } else if (changes.mode) {
        this.audioPlayer.stop();
      }
    }
  }

  ngOnDestroy() {
    this.clear();
  }

  onSpectrogramDragStart() {
    this.audioPlayer.stop();
  }

  onSpectrogramDragEnd(time: number) {
    this.audioPlayer.startFrom(time);
  }

  onSpectrogramZoomEnd(area: IAudioViewerArea) {
    this.mode = 'default';
    this.localZoomArea = area;
    this.audioPlayer.setPlayArea(this.getPlayArea());
  }

  onSpectrogramDrawEnd(area: IAudioViewerArea) {
    this.drawEnd.emit({
      xRange: [area.xRange[0] + this.extractedStartX, area.xRange[1] + this.extractedStartX],
      yRange: area.yRange
    });
  }

  clearZoomArea() {
    this.localZoomArea = undefined;
    this.audioPlayer.setPlayArea(this.getPlayArea());
  }

  toggleZoomMode() {
    this.audioPlayer.stop();
    this.mode = this.mode === 'zoom' ? 'default' : 'zoom';
  }

  setAudioLoading(loading: boolean) {
    this.loading = loading;
    this.audioLoading.emit(loading);
  }

  private clear() {
    if (this.audioSub) {
      this.audioSub.unsubscribe();
    }

    this.buffer = undefined;
    this.extractedBuffer = undefined;
    this.localZoomArea = undefined;
    this.hasError = false;
    this.audioPlayer.clear();
  }

  private setBuffer(buffer: AudioBuffer) {
    const xRange = AudioViewerUtils.getPaddedRange(this.focusArea?.xRange, this.focusAreaTimePadding, 0, buffer.duration);
    this.extractedStartX = xRange[0];

    if (this.focusArea) {
      this.localFocusArea = {
        xRange: this.focusArea?.xRange ? [this.focusArea.xRange[0] - xRange[0], this.focusArea.xRange[1] - xRange[0]] : undefined,
        yRange: this.focusArea?.yRange
      };
    } else {
      this.localFocusArea = undefined;
    }

    this.extractedBuffer = this.audioService.normaliseAudio(
      this.audioService.extractSegment(buffer, xRange[0], xRange[1], this.duration)
    );

    this.audioPlayer.setBuffer(this.extractedBuffer, this.getPlayArea());
  }

  private areaIsValid(buffer: AudioBuffer, area: IAudioViewerArea): boolean {
    const [minValue, maxValue] = [0, buffer.duration];
    return !(area?.xRange && this.rangeIsNotValid(area.xRange, minValue, maxValue));
  }

  private rangeIsNotValid(range: number[], minValue: number, maxValue: number): boolean {
    if (range[1] < range[0]) {
      return true;
    }
    return range[1] < minValue || range[0] > maxValue;
  }

  private onError() {
    this.hasError = true;
    this.setAudioLoading(false);
    this.cdr.markForCheck();
  }

  private getPlayArea(): IAudioViewerArea {
    if (this.localZoomArea) {
      return this.localZoomArea;
    }

    return {
      xRange: this.highlightFocusArea ? this.localFocusArea?.xRange : undefined,
      yRange: (this.highlightFocusArea || this.zoomFrequency) ? this.localFocusArea?.yRange : undefined
    };
  }
}
