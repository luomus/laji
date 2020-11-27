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

  @Input() focusArea: IAudioViewerArea;
  @Input() focusAreaTimePadding: number;
  @Input() zoomFrequency = false;

  @Input() autoplay = false;
  @Input() autoplayRepeat = 1;

  @Input() highlightFocusArea = false;
  @Input() showBrushControl = false;

  @Input() sampleRate = 22050;
  @Input() nperseg = 256;
  @Input() noverlap = 256 - 160;

  localFocusArea: IAudioViewerArea;
  brushArea: IAudioViewerArea;

  mode: AudioViewerMode = 'default';
  buffer: AudioBuffer;
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
    this.audioPlayer.autoplay = this.autoplay;
    this.audioPlayer.autoplayRepeat = this.autoplayRepeat;

    if (changes.recording || changes.focusArea || changes.focusAreaTimePadding) {
      this.clear();
      this.setAudioLoading(true);

      if (this.recording) {
        this.audioSub = this.audioService.getAudioBuffer(this.recording).subscribe((buffer) => {
          if (!this.areaIsValid(buffer, this.focusArea)) {
            this.onError();
            return;
          }

          this.setBuffer(buffer);

          if (this.autoplay && changes.recording) {
            this.audioPlayer.startAutoplay();
          }

          this.cdr.markForCheck();
        }, e => {
          this.onError();
        });
      }
    } else if (changes.zoomFrequency || changes.highlightFocusArea) {
      this.audioPlayer.setPlayArea(this.getPlayArea());
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
    this.brushArea = area;
    this.audioPlayer.setPlayArea(this.getPlayArea());
  }

  clearBrushArea() {
    this.brushArea = undefined;
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
    this.brushArea = undefined;
    this.hasError = false;
    this.audioPlayer.clear();
  }

  private setBuffer(buffer: AudioBuffer) {
    const xRange = AudioViewerUtils.getPaddedRange(this.focusArea?.xRange, this.focusAreaTimePadding, 0, buffer.duration);

    this.localFocusArea = {
      xRange: this.focusArea?.xRange ? [this.focusArea.xRange[0] - xRange[0], this.focusArea.xRange[1] - xRange[0]] : undefined,
      yRange: this.focusArea?.yRange
    };

    buffer = this.audioService.extractSegment(buffer, xRange[0], xRange[1]);
    this.buffer = buffer;

    this.audioPlayer.setBuffer(buffer, this.getPlayArea());
  }

  private areaIsValid(buffer: AudioBuffer, area: IAudioViewerArea): boolean {
    const [minValue, maxValue] = [0, buffer.duration];
    if (area?.xRange && this.rangeIsNotValid(area.xRange, minValue, maxValue)) {
      return false;
    }
    return true;
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
    if (this.brushArea) {
      return this.brushArea;
    }

    return {
      xRange: this.highlightFocusArea ? this.localFocusArea?.xRange : undefined,
      yRange: (this.highlightFocusArea || this.zoomFrequency) ? this.localFocusArea?.yRange : undefined
    };
  }
}
