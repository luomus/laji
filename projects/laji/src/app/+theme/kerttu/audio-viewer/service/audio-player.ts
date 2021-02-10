import {IAudioViewerArea} from '../models';
import {ChangeDetectorRef, NgZone} from '@angular/core';
import {AudioService} from './audio.service';
import {interval, Subscription} from 'rxjs';

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

  // private startedOutsidePlayArea = false;
  private autoplayCounter = 0;

  private timeupdateInterval = interval(20);
  private timeupdateIntervalSub: Subscription;

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
    this.currentTime = this.getStartTime();
  }

  toggle() {
    if (!this.buffer) {
      return;
    }

    if (!this.isPlaying) {
      this.isPlaying = true;

      if (!this.currentTime || this.currentTime >= this.getEndTime() || this.currentTime < this.getStartTime()) {
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
      this.audioService.stopAudio(this.source);
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
      this.source.onended = () => {
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
      this.audioService.stopAudio(this.source);
      this.source.onended = () => {};
    }

    this.currentTime = undefined;
    this.isPlaying = false;
    this.source = undefined;
  }

  private startFromMiddle(time: number) {
    /*if (time < this.playArea?.xRange[0] || time > this.playArea?.xRange[1]) {
      this.startedOutsidePlayArea = true;
    }*/

    this.currentTime = time;
    this.toggle();
  }

  private sourceOnEnded() {
    this.clearTimeupdateInterval();
    this.updateCurrentTime();
    this.isPlaying = false;
    // this.startedOutsidePlayArea = false;

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
    this.timeupdateIntervalSub = this.timeupdateInterval.subscribe(() => {
      this.updateCurrentTime();
      this.cdr.markForCheck();
    });
  }

  private clearTimeupdateInterval() {
    if (this.timeupdateIntervalSub) {
      this.timeupdateIntervalSub.unsubscribe();
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
      this.audioService.stopAudio(this.source);
    }
  }

  private getStartTime() {
    if (this.playArea?.xRange
    //  && !this.startedOutsidePlayArea
    ) {
      return this.playArea.xRange[0];
    } else {
      return 0;
    }
  }

  private getEndTime() {
    if (this.playArea?.xRange
    // && !this.startedOutsidePlayArea
    ) {
      return this.playArea.xRange[1];
    } else {
      return this.buffer.duration;
    }
  }
}
