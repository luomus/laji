import {ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from '@angular/core';
import { AudioService } from '../../service/audio.service';
import { DOCUMENT } from '@angular/common';
import { WINDOW } from '@ng-toolkit/universal';
import {Subscription} from 'rxjs';

@Component({
  selector: 'laji-audio-viewer',
  templateUrl: './audio-viewer.component.html',
  styleUrls: ['./audio-viewer.component.scss']
})
export class AudioViewerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() recording: string;

  @Input() xRangePadding: number;
  @Input() xRange: number[];
  @Input() yRange: number[];

  @Input() zoomed = false;

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

  private context: AudioContext;
  private source: AudioBufferSourceNode;
  private startOffset = 0;
  private startTime: number;

  private audioSub: Subscription;
  private timeupdateInterval;

  constructor(
    @Inject(WINDOW) private window: Window,
    private cdr: ChangeDetectorRef,
    private audioService: AudioService,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.recording) {
      this.clear();
      this.setAudioLoading(true);

      if (this.recording) {
        this.context = new (this.window['AudioContext'] || this.window['webkitAudioContext'])({sampleRate: this.sampleRate});
        this.audioSub = this.audioService.getAudioBuffer(this.recording, this.context).subscribe((buffer) => {
          this.start = 0;
          this.stop = buffer.duration;

          if (this.xRange && this.xRangePadding) {
            this.start = this.xRange[0] - this.xRangePadding;
            this.stop = this.xRange[1] + this.xRangePadding;

            if (this.start < 0) {
              this.stop = Math.min(this.stop - this.start, buffer.duration);
              this.start = 0;
            }
            if (this.stop > buffer.duration) {
              this.start = Math.max(this.start - (this.stop - buffer.duration), 0);
              this.stop = buffer.duration;
            }
          }

          buffer = this.audioService.extractSegment(buffer, this.context, this.start, this.stop, this.duration);

          this.buffer = buffer;
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

      this.source = this.context.createBufferSource();
      this.source.buffer = this.buffer;
      if (this.zoomed) {
        const highpassFilter = this.createFilter('highpass', this.yRange[0]);
        const lowpassFilter = this.createFilter('lowpass', this.yRange[1]);
        this.source.connect(highpassFilter);
        highpassFilter.connect(lowpassFilter);
        lowpassFilter.connect(this.context.destination);
      } else {
        this.source.connect(this.context.destination);
      }

      this.source.start(0, this.currentTime);
      this.startTime = this.context.currentTime;

      this.source.onended = () => {
        this.clearTimeupdateInterval();
        this.updateCurrentTime();
        this.isPlaying = false;
        this.cdr.detectChanges();
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
      const onendedFunc = this.source.onended;
      this.source.onended = (args) => {
        onendedFunc.bind(this)(args);
        this.currentTime = time;
        this.cdr.detectChanges();
      };
    } else {
      this.currentTime = time;
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
      this.currentTime = this.startOffset + this.getPlayedTime();
    } else {
      this.currentTime = this.startOffset;
    }

    this.currentTime = Math.min(this.currentTime, this.buffer.duration);
  }

  private getPlayedTime() {
    return (this.context.currentTime - this.startTime) * this.source.playbackRate.value;
  }

  private clear() {
    if (this.audioSub) {
      this.audioSub.unsubscribe();
    }

    this.clearTimeupdateInterval();

    if (this.source && this.isPlaying) {
      this.source.stop(0);
    }

    this.buffer = undefined;
    this.currentTime = 0;
    this.isPlaying = false;
    this.source = undefined;
  }

  private createFilter(type: 'highpass'|'lowpass', frequency: number) {
    const filter = this.context.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    return filter;
  }

  setAudioLoading(loading: boolean) {
    this.loading = loading;
    this.audioLoading.emit(loading);
  }
}
