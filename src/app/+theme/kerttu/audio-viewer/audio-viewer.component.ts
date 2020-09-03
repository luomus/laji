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

  @Input() zoomed = false;
  @Input() autoplay = false;
  @Input() autoplayRepeat = 1;

  @Input() sampleRate = 16000;
  @Input() nperseg = 256;
  @Input() noverlap = 256 - 160;
  @Input() duration = 60;

  start = 0;
  stop: number;

  buffer: AudioBuffer;
  currentTime = 0;

  isPlaying = false;

  loading = false;
  @Output() audioLoading = new EventEmitter<boolean>();

  private source: AudioBufferSourceNode;
  private startOffset = 0;
  private startTime: number;

  private autoplayCounter = 0;

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
    if (changes.recording || changes.xRangePadding) {
      this.clear();
      this.setAudioLoading(true);

      if (this.recording) {
        this.audioSub = this.audioService.getAudioBuffer(this.recording).subscribe((buffer) => {
          [this.start, this.stop] = KerttuUtils.getPaddedRange(this.xRange, this.xRangePadding, 0, buffer.duration);
          buffer = this.audioService.extractSegment(buffer, this.start, this.stop, this.duration);
          this.buffer = buffer;

          if (this.autoplay && changes.recording) {
            this.autoplayCounter = 0;
            this.toggleAudio();
          }

          this.cdr.markForCheck();
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

      if (this.currentTime === this.buffer.duration) {
        this.currentTime = 0;
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
          this.currentTime = time;
          this.toggleAudio();
          this.cdr.markForCheck();
        });
      };
    } else {
      this.currentTime = time;
      this.toggleAudio();
    }
  }

  private sourceOnEnded() {
    this.clearTimeupdateInterval();
    this.updateCurrentTime();
    this.isPlaying = false;

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

    this.currentTime = Math.min(this.currentTime, this.buffer.duration);
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
    this.currentTime = 0;
    this.isPlaying = false;
    this.source = undefined;
  }

  setAudioLoading(loading: boolean) {
    this.loading = loading;
    this.audioLoading.emit(loading);
  }
}
