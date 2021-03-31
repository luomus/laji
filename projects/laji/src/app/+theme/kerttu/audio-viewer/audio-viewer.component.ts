import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { AudioService } from './service/audio.service';
import { WINDOW } from '@ng-toolkit/universal';
import {Subscription} from 'rxjs';
import {AudioViewerMode, IAudioViewerArea} from './models';
import {AudioPlayer} from './service/audio-player';
import {AudioViewerUtils} from './service/audio-viewer-utils';

@Component({
  selector: 'laji-audio-viewer',
  templateUrl: './audio-viewer.component.html',
  styleUrls: ['./audio-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioViewerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() recording: string;

  @Input() focusArea: IAudioViewerArea; // focus area is drawn with white rectangle to the spectrogram
  @Input() focusAreaTimePadding: number; // how much recording is shown outside the focus area (if undefined the whole recording is shown)
  @Input() zoomFrequency = false;

  @Input() autoplay = false;
  @Input() autoplayRepeat = 1;

  @Input() highlightFocusArea = false; // highlighting darkens the spectrogram background and allows to play the sound only in the focus area
  @Input() showBrushControl = false; // brush control allows the user to zoom into spectrogram

  @Input() sampleRate = 22050;
  @Input() nperseg = 256;
  @Input() noverlap = 256 - 160;

  localFocusArea: IAudioViewerArea; // focus area in extracted audio
  localBrushArea: IAudioViewerArea; // brush area in extracted audio

  mode: AudioViewerMode = 'default';
  buffer: AudioBuffer;
  extractedBuffer: AudioBuffer;
  audioPlayer: AudioPlayer;

  loading = false;
  hasError = false;

  @Output() audioLoading = new EventEmitter<boolean>();

  private audioSub: Subscription;

  constructor(
    @Inject(WINDOW) private window: Window,
    private cdr: ChangeDetectorRef,
    private audioService: AudioService,
    private ngZone: NgZone
  ) {
    this.audioPlayer = new AudioPlayer(this.audioService, this.ngZone, this.cdr);
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.recording) {
      this.clear();
      this.setAudioLoading(true);

      if (this.recording) {
        this.audioSub = this.audioService.getAudioBuffer(this.recording).subscribe((buffer) => {
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
        this.setBuffer(this.buffer);
      } else if (changes.zoomFrequency || changes.highlightFocusArea) {
        this.audioPlayer.setPlayArea(this.getPlayArea());
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

  onSpectrogramBrushEnd(area: IAudioViewerArea) {
    this.mode = 'default';
    this.localBrushArea = area;
    this.audioPlayer.setPlayArea(this.getPlayArea());
  }

  clearBrushArea() {
    this.localBrushArea = undefined;
    this.audioPlayer.setPlayArea(this.getPlayArea());
  }

  toggleBrushMode() {
    this.audioPlayer.stop();
    this.mode = this.mode === 'brush' ? 'default' : 'brush';
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
    this.localBrushArea = undefined;
    this.hasError = false;
    this.audioPlayer.clear();
  }

  private setBuffer(buffer: AudioBuffer) {
    const xRange = AudioViewerUtils.getPaddedRange(this.focusArea?.xRange, this.focusAreaTimePadding, 0, buffer.duration);

    this.localFocusArea = {
      xRange: this.focusArea?.xRange ? [this.focusArea.xRange[0] - xRange[0], this.focusArea.xRange[1] - xRange[0]] : undefined,
      yRange: this.focusArea?.yRange
    };

    this.extractedBuffer = this.audioService.normaliseAudio(
      this.audioService.extractSegment(buffer, xRange[0], xRange[1])
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
    if (this.localBrushArea) {
      return this.localBrushArea;
    }

    return {
      xRange: this.highlightFocusArea ? this.localFocusArea?.xRange : undefined,
      yRange: (this.highlightFocusArea || this.zoomFrequency) ? this.localFocusArea?.yRange : undefined
    };
  }
}
