import {IAudioViewerArea} from '../models';
import {ChangeDetectorRef, NgZone} from '@angular/core';
import {AudioService} from './audio.service';

export class AudioPlayer {
  isPlaying = false;
  currentTime: number;

  autoplay = false;
  autoplayRepeat = 1;

  private buffer: AudioBuffer;
  private playArea: IAudioViewerArea;

  private source: AudioBufferSourceNode;
  private startOffset = 0;
  private startTime: number;

  private startedOutsidePlayArea = false;
  private autoplayCounter = 0;

  private timeupdateInterval;

  constructor(
    private audioService: AudioService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) { }

  setBuffer(buffer: AudioBuffer, playArea?: IAudioViewerArea) {
    this.buffer = buffer;

    this.playArea = playArea;
    this.currentTime = this.getStartTime();
  }

  setPlayArea(playArea: IAudioViewerArea) {
    this.stop();
    this.playArea = playArea;
  }

  toggle() {
    if (!this.buffer) {
      return;
    }

    if (!this.isPlaying) {
      this.isPlaying = true;

      if (!this.currentTime || this.currentTime >= this.getEndTime()) {
        this.currentTime = this.getStartTime();
      }
      this.startOffset = this.currentTime;

      this.source = this.audioService.playAudio(this.buffer, this.playArea?.yRange ? this.playArea.yRange : undefined, this.currentTime);
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

  stop() {
    if (this.isPlaying) {
      this.toggle();
    }
  }

  startFrom(time: number) {
    if (this.isPlaying) {
      this.toggle();
      this.source.onended = (args) => {
        this.ngZone.run(() => {
          this.sourceOnEnded();
          this.startFromMiddle(time);
          this.cdr.markForCheck();
        });
      };
    } else {
      this.startFromMiddle(time);
    }
  }

  startAutoplay() {
    this.autoplayCounter = 0;
    this.toggle();
  }

  clear() {
    this.clearTimeupdateInterval();

    if (this.source && this.isPlaying) {
      this.source.stop(0);
      this.source.onended = () => {};
    }

    this.currentTime = undefined;
    this.isPlaying = false;
    this.source = undefined;
  }

  private startFromMiddle(time: number) {
    if (time < this.playArea?.xRange[0] || time > this.playArea?.xRange[1]) {
      this.startedOutsidePlayArea = true;
    }

    this.currentTime = time;
    this.toggle();
  }

  private sourceOnEnded() {
    this.clearTimeupdateInterval();
    this.updateCurrentTime();
    this.isPlaying = false;
    this.startedOutsidePlayArea = false;

    if (this.autoplay && this.autoplayCounter < this.autoplayRepeat - 1) {
      if (this.currentTime === this.buffer.duration) {
        this.autoplayCounter += 1;
        this.toggle();
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

  private getStartTime() {
    if (this.playArea?.xRange && !this.startedOutsidePlayArea) {
      return this.playArea.xRange[0];
    } else {
      return 0;
    }
  }

  private getEndTime() {
    if (this.playArea?.xRange && !this.startedOutsidePlayArea) {
      return this.playArea.xRange[1];
    } else {
      return this.buffer.duration;
    }
  }
}
