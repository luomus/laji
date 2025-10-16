/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { AudioViewerArea } from '../models';
import { effect, inject, NgZone, Signal, signal, untracked } from '@angular/core';
import { AudioService } from './audio.service';
import { interval, Subscription } from 'rxjs';

export class AudioPlayer {
  private readonly isPlayingSignal = signal(false);
  readonly isPlaying = this.isPlayingSignal.asReadonly();

  private readonly currentTimeSignal = signal(0);
  readonly currentTime = this.currentTimeSignal.asReadonly();

  private readonly loopSignal = signal(false);
  readonly loop = this.loopSignal.asReadonly();

  private readonly playBackRateSignal = signal(1);
  readonly playBackRate = this.playBackRateSignal.asReadonly();

  private readonly buffer: Signal<AudioBuffer|undefined>;
  private readonly playArea: Signal<AudioViewerArea|undefined>;

  private source?: AudioBufferSourceNode;
  private startOffset = 0;
  private startAudioContextTime?: number;
  private startedOutsidePlayArea? = false;

  private autoplay = false;
  private autoplayRepeat = 1;
  private autoplayCounter = 0;

  private timeupdateInterval = interval(20);
  private timeupdateIntervalSub?: Subscription;

  private resumingContext = false;
  private resumeContextSub?: Subscription;

  private audioService: AudioService;
  private ngZone: NgZone;

  constructor(buffer: Signal<AudioBuffer|undefined>, playArea: Signal<AudioViewerArea|undefined>) {
    this.audioService = inject(AudioService);
    this.ngZone = inject(NgZone);
    this.buffer = buffer;
    this.playArea = playArea;

    effect(() => {
      this.buffer(); // effect is triggered when buffer changes
      untracked(() => {
        this.clear();
        this.currentTimeSignal.set(this.getStartTime());
      });
    }, { allowSignalWrites: true });

    effect(() => {
      this.playArea();
      untracked(() => {
        this.stop();
        this.currentTimeSignal.set(this.getStartTime());
      });
    }, { allowSignalWrites: true });
  }

  setLoop(loop: boolean) {
    this.loopSignal.set(loop);
  }

  setPlayBackRate(playBackRate: number) {
    this.stop();
    this.playBackRateSignal.set(playBackRate);
  }

  toggle() {
    this.isPlaying() ? this.stop() : this.start();
  }

  stop() {
    this.stopPlaying();
  }

  start() {
    this.startedOutsidePlayArea = this.playArea() && (this.currentTime() < this.playArea()!.xRange![0] || this.currentTime() > this.playArea()!.xRange![1]);

    if (this.resumingContext) {
      return;
    }

    if (this.audioService.audioContextIsSuspended(this.buffer()!.sampleRate)) {
      this.resumingContext = true;
      this.resumeContextSub = this.audioService.resumeAudioContext(this.buffer()!.sampleRate).subscribe(() => {
        this.resumingContext = false;
        this.startPlaying();
      });
    } else {
      this.startPlaying();
    }
  }

  startFrom(time: number) {
    this.stop();
    this.currentTimeSignal.set(time);
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

    this.currentTimeSignal.set(0);
    this.isPlayingSignal.set(false);
    this.source = undefined;
  }

  private startPlaying() {
    if (!this.isPlaying()) {
      this.isPlayingSignal.set(true);
      if (!this.currentTime() || this.currentTime() >= this.getEndTime() || this.currentTime() < this.getStartTime()) {
        this.currentTimeSignal.set(this.getStartTime());
      }
      this.startOffset = this.currentTime();

      this.source = this.audioService.playAudio(this.buffer()!, this.playBackRate(), this.playArea()?.yRange, this.currentTime(), this);
      this.startAudioContextTime = this.audioService.getAudioContextTime(this.buffer()!.sampleRate);

      this.source.onended = () => {
        this.ngZone.run(() => {
          this.onPlayingEnded();
        });
      };

      this.startTimeupdateInterval();
    }
  }

  private stopPlaying() {
    if (this.isPlaying()) {
      const source = this.source as AudioBufferSourceNode;
      source.onended = () => {};
      this.onPlayingStopped();
      this.audioService.stopAudio(source);
    }
  }

  private onPlayingStopped() {
    this.clearTimeupdateInterval();
    this.updateCurrentTime();
    this.isPlayingSignal.set(false);
    this.autoplayCounter = this.autoplayRepeat;
  }

  private onPlayingEnded() {
    this.clearTimeupdateInterval();
    this.updateCurrentTime();
    this.isPlayingSignal.set(false);

    if (this.currentTime() === this.getEndTime()) {
      if (this.autoplay && this.autoplayCounter < this.autoplayRepeat - 1) {
        this.autoplayCounter += 1;
        this.toggle();
        return;
      }
      if (this.loop()) {
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

      if (this.currentTime() === endTime && endTime !== this.buffer()!.duration) {
        this.audioService.stopAudio(this.source!);
      }
    });
  }

  private clearTimeupdateInterval() {
    if (this.timeupdateIntervalSub) {
      this.timeupdateIntervalSub.unsubscribe();
    }
  }

  private updateCurrentTime() {
    const playedTime = this.startOffset + this.audioService.getPlayedTime(this.buffer()!.sampleRate, this.startAudioContextTime!, this.source!.playbackRate.value);
    this.currentTimeSignal.set(Math.min(playedTime, this.getEndTime()));
  }

  private getStartTime(): number {
    if (!this.startedOutsidePlayArea && this.playArea()?.xRange) {
      return this.playArea()!.xRange![0];
    } else {
      return 0;
    }
  }

  private getEndTime(): number {
    if (!this.startedOutsidePlayArea && this.playArea()?.xRange) {
      return this.playArea()!.xRange![1];
    } else {
      return this.buffer()!.duration;
    }
  }
}
