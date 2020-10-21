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
import { AudioService } from '../service/audio.service';
import { WINDOW } from '@ng-toolkit/universal';
import {Subscription} from 'rxjs';
import { KerttuUtils } from '../service/kerttu-utils';

@Component({
  selector: 'laji-audio-viewer',
  templateUrl: './audio-viewer.component.html',
  styleUrls: ['./audio-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioViewerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() recording: string;

  @Input() xRangePadding: number;
  @Input() xRange: number[];
  @Input() yRange: number[];
  @Input() highlightSelection = false;

  @Input() zoomed = false;
  @Input() autoplay = false;
  @Input() autoplayRepeat = 1;
  @Input() showBrushControl = false;

  @Input() sampleRate = 22050;
  @Input() nperseg = 256;
  @Input() noverlap = 256 - 160;

  xRangeInSegment: number[];

  buffer: AudioBuffer;
  currentTime: number;

  isPlaying = false;
  isInBrushMode = false;

  loading = false;
  @Output() audioLoading = new EventEmitter<boolean>();

  hasError = false;

  private source: AudioBufferSourceNode;
  private startOffset = 0;
  private startTime: number;

  private autoplayCounter = 0;
  private startedOutsideHighlighted = false;

  private audioSub: Subscription;
  private timeupdateInterval;

  constructor(
    @Inject(WINDOW) private window: Window,
    private cdr: ChangeDetectorRef,
    private audioService: AudioService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.recording || changes.xRange || changes.xRangePadding) {
      this.clear();
      this.setAudioLoading(true);

      if (this.recording) {
        this.audioSub = this.audioService.getAudioBuffer(this.recording).subscribe((buffer) => {
          const [minValue, maxValue] = [0, buffer.duration];
          if (this.xRange && this.rangeIsNotValid(this.xRange, minValue, maxValue)) {
            this.onError();
            return;
          }

          const range = KerttuUtils.getPaddedRange(this.xRange, this.xRangePadding, 0, buffer.duration);
          if (this.xRange) {
            this.xRangeInSegment = [this.xRange[0] - range[0], this.xRange[1] - range[0]];
          }
          this.currentTime = this.getStartTime();

          buffer = this.audioService.extractSegment(buffer, range[0], range[1]);
          this.buffer = buffer;

          if (this.autoplay && changes.recording) {
            this.autoplayCounter = 0;
            this.toggleAudio();
          }

          this.cdr.markForCheck();
        }, e => {
          this.onError();
        });
      }
    } else if (changes.zoomed) {
      if (this.isPlaying) {
        this.toggleAudio();
      }
    }
  }

  ngOnDestroy() {
    this.clear();
  }

  toggleAudio() {
    if (!this.buffer) {
      return;
    }

    if (!this.isPlaying) {
      this.isPlaying = true;

      if (!this.currentTime || this.currentTime >= this.getEndTime()) {
        this.currentTime = this.getStartTime();
      }
      this.startOffset = this.currentTime;

      this.source = this.audioService.playAudio(this.buffer, this.zoomed ? this.yRange : undefined, this.currentTime);
      this.startTime = this.audioService.getTime();

      this.source.onended = () => {
        this.ngZone.run(() => {
          this.sourceOnEnded();
          this.cdr.markForCheck();
        });
      };
      this.startTimeupdateInterval();
    } else {
      this.source.stop(0);
    }
  }

  onSpectrogramDragStart() {
    if (this.isPlaying) {
      this.toggleAudio();
    }
  }

  onSpectrogramDragEnd(time: number) {
    if (this.isPlaying) {
      this.toggleAudio();
      this.source.onended = (args) => {
        this.ngZone.run(() => {
          this.sourceOnEnded();
          this.startAudioFromMiddle(time);
          this.cdr.markForCheck();
        });
      };
    } else {
      this.startAudioFromMiddle(time);
    }
  }

  toggleBrushMode() {
    if (this.isPlaying) {
      this.toggleAudio();
    }
    this.isInBrushMode = !this.isInBrushMode;
  }

  onSpectrogramBrushEnd([xRange, yRange]: number[][]) {
    console.log(xRange);
    console.log(yRange);
  }

  private startAudioFromMiddle(time: number) {
    if (this.highlightSelection && (time < this.xRangeInSegment[0] || time > this.xRangeInSegment[1])) {
      this.startedOutsideHighlighted = true;
    }
    this.currentTime = time;
    this.toggleAudio();
  }

  private getStartTime() {
    if (this.highlightSelection && !this.startedOutsideHighlighted) {
      return this.xRangeInSegment[0];
    } else {
      return 0;
    }
  }

  private getEndTime() {
    if (this.highlightSelection && !this.startedOutsideHighlighted) {
      return this.xRangeInSegment[1];
    } else {
      return this.buffer.duration;
    }
  }

  private sourceOnEnded() {
    this.clearTimeupdateInterval();
    this.updateCurrentTime();
    this.isPlaying = false;
    this.startedOutsideHighlighted = false;

    if (this.autoplay && this.autoplayCounter < this.autoplayRepeat - 1) {
      if (this.currentTime === this.buffer.duration) {
        this.autoplayCounter += 1;
        this.toggleAudio();
      } else {
        this.autoplayCounter = this.autoplayRepeat;
      }
    }
  }

  private startTimeupdateInterval() {
    this.timeupdateInterval = setInterval(() => {
      this.updateCurrentTime();
      this.cdr.markForCheck();
    }, 10);
  }

  private clearTimeupdateInterval() {
    if (this.timeupdateInterval) {
      clearInterval(this.timeupdateInterval);
    }
  }

  private updateCurrentTime() {
    if (this.isPlaying) {
      this.currentTime = this.startOffset + this.audioService.getPlayedTime(this.startTime, this.source.playbackRate.value);
    } else {
      this.currentTime = this.startOffset;
    }

    const endTime = this.getEndTime();

    this.currentTime = Math.min(this.currentTime, endTime);

    if (this.currentTime === endTime) {
      this.source.stop(0);
    }
  }

  private clear() {
    if (this.audioSub) {
      this.audioSub.unsubscribe();
    }

    this.clearTimeupdateInterval();

    if (this.source && this.isPlaying) {
      this.source.stop(0);
      this.source.onended = () => {};
    }

    this.buffer = undefined;
    this.currentTime = undefined;
    this.isPlaying = false;
    this.source = undefined;
    this.hasError = false;
  }

  setAudioLoading(loading: boolean) {
    this.loading = loading;
    this.audioLoading.emit(loading);
  }

  private rangeIsNotValid(range: number[], minValue: number, maxValue: number) {
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
}
