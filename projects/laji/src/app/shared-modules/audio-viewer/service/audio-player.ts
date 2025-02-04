import { IAudioViewerArea } from '../models';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { AudioService } from './audio.service';
import { interval, Subscription } from 'rxjs';

export class AudioPlayer {
  isPlaying = false;
  currentTime?: number;

  loop = false;

  private buffer?: AudioBuffer;
  private playArea?: IAudioViewerArea;

  private source?: AudioBufferSourceNode;
  private startOffset = 0;
  private startAudioContextTime?: number;
  private startedOutsidePlayArea? = false;

  private autoplay = false;
  private autoplayRepeat = 1;
  private autoplayCounter = 0;

  private playBackRate = 1;

  private timeupdateInterval = interval(20);
  private timeupdateIntervalSub?: Subscription;

  private resumingContext = false;
  private resumeContextSub?: Subscription;

  constructor(
    private audioService: AudioService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  setBuffer(buffer: AudioBuffer, playArea?: IAudioViewerArea) {
    this.clear();
    this.buffer = buffer;
    this.playArea = playArea;
    this.currentTime = this.getStartTime();
  }

  setPlayArea(playArea: IAudioViewerArea) {
    this.stop();
    this.playArea = playArea;
    this.currentTime = this.getStartTime();
  }

  setPlayBackRate(playBackRate: number) {
    this.stop();
    this.playBackRate = playBackRate;
  }

  toggle() {
    this.isPlaying ? this.stop() : this.start();
  }

  stop() {
    this.stopPlaying();
    this.cdr.markForCheck();
  }

  start() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.startedOutsidePlayArea = this.playArea && (this.currentTime! < this.playArea!.xRange![0] || this.currentTime! > this.playArea!.xRange![1]);

    if (this.resumingContext) {
      return;
    }

    if (this.audioService.audioContextIsSuspended()) {
      this.resumingContext = true;
      this.resumeContextSub = this.audioService.resumeAudioContext().subscribe(() => {
        this.resumingContext = false;
        this.startPlaying();
        this.cdr.markForCheck();
      });
    } else {
      this.startPlaying();
      this.cdr.markForCheck();
    }
  }

  startFrom(time: number) {
    this.stop();
    this.currentTime = time;
    this.start();
  }

  startAutoplay(times: number) {
    this.stop();
    this.autoplay = true;
    this.autoplayRepeat = times;
    this.autoplayCounter = 0;
    this.start();
  }

  clear() {
    if (this.resumeContextSub) {
      this.resumeContextSub.unsubscribe();
    }
    if (this.source) {
      this.stop();
    }

    this.currentTime = undefined;
    this.isPlaying = false;
    this.source = undefined;
  }

  private startPlaying() {
    if (!this.isPlaying) {
      this.isPlaying = true;
      if (!this.currentTime || this.currentTime >= this.getEndTime() || this.currentTime < this.getStartTime()) {
        this.currentTime = this.getStartTime();
      }
      this.startOffset = this.currentTime;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.source = this.audioService.playAudio(this.buffer!, this.playBackRate, this.playArea?.yRange, this.currentTime, this);
      this.startAudioContextTime = this.audioService.getAudioContextTime();

      this.source.onended = () => {
        this.ngZone.run(() => {
          this.onPlayingEnded();
          this.cdr.markForCheck();
        });
      };

      this.startTimeupdateInterval();
    }
  }

  private stopPlaying() {
    if (this.isPlaying) {
      const source = this.source as AudioBufferSourceNode;
      source.onended = () => {};
      this.onPlayingStopped();
      this.audioService.stopAudio(source);
    }
  }

  private onPlayingStopped() {
    this.clearTimeupdateInterval();
    this.updateCurrentTime();
    this.isPlaying = false;
    this.autoplayCounter = this.autoplayRepeat;
  }

  private onPlayingEnded() {
    this.clearTimeupdateInterval();
    this.updateCurrentTime();
    this.isPlaying = false;

    if (this.currentTime === this.getEndTime()) {
      if (this.autoplay && this.autoplayCounter < this.autoplayRepeat - 1) {
        this.autoplayCounter += 1;
        this.toggle();
        return;
      }
      if (this.loop) {
        this.toggle();
      }
    } else {
      this.autoplayCounter = this.autoplayRepeat;
    }
  }

  private startTimeupdateInterval() {
    this.timeupdateIntervalSub = this.timeupdateInterval.subscribe(() => {
      this.updateCurrentTime();
      const endTime = this.getEndTime();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (this.currentTime === endTime && endTime !== this.buffer!.duration) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.audioService.stopAudio(this.source!);
      }
      this.cdr.markForCheck();
    });
  }

  private clearTimeupdateInterval() {
    if (this.timeupdateIntervalSub) {
      this.timeupdateIntervalSub.unsubscribe();
    }
  }

  private updateCurrentTime() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const playedTime = this.startOffset + this.audioService.getPlayedTime(this.startAudioContextTime!, this.source!.playbackRate.value);
    this.currentTime = Math.min(playedTime, this.getEndTime());
  }

  private getStartTime(): number {
    if (!this.startedOutsidePlayArea && this.playArea?.xRange) {
      return this.playArea.xRange[0];
    } else {
      return 0;
    }
  }

  private getEndTime(): number {
    if (!this.startedOutsidePlayArea && this.playArea?.xRange) {
      return this.playArea.xRange[1];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.buffer!.duration;
    }
  }
}
