import {IAudioViewerArea} from '../models';
import {ChangeDetectorRef, NgZone} from '@angular/core';
import {AudioService} from './audio.service';
import {interval, Subscription, Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';

export class AudioPlayer {
  isPlaying = false;
  isLoading = false;
  currentTime: number;

  autoplay = false;
  autoplayRepeat = 1;

  private buffer: AudioBuffer;
  private playArea: IAudioViewerArea;

  private source: AudioBufferSourceNode;
  private startOffset = 0;
  private startAudioContextTime: number;

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
    if (this.isLoading) {
      return;
    }

    const obs: Observable<boolean> = this.isPlaying ? this.stopPlaying() : this.startPlaying();
    obs.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  stop() {
    if (this.isLoading) {
      return;
    }

    this.stopPlaying().subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  startFrom(time: number) {
    if (this.isLoading) {
      return;
    }

    this.stopPlaying().pipe(switchMap(() => {
      this.currentTime = time;
      return this.startPlaying();
    })).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  startAutoplay() {
    if (this.isLoading) {
      return;
    }

    this.autoplayCounter = 0;
    this.startPlaying().subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  clear() {
    this.clearTimeupdateInterval();

    if (this.source && this.isPlaying) {
      this.audioService.stopAudio(this.source);
    }

    this.currentTime = undefined;
    this.isPlaying = false;
    this.source = undefined;
  }

  private startPlaying(): Observable<boolean> {
    if (!this.isPlaying) {
      this.isLoading = true;
      if (!this.currentTime || this.currentTime >= this.getEndTime() || this.currentTime < this.getStartTime()) {
        this.currentTime = this.getStartTime();
      }
      this.startOffset = this.currentTime;

      return this.audioService.playAudio(this.buffer, this.playArea?.yRange ? this.playArea.yRange : undefined, this.currentTime, this).pipe(
        tap(source => {
          this.startAudioContextTime = this.audioService.getTime();

          this.source = source;
          this.source.onended = () => {
            this.ngZone.run(() => {
              this.onPlayingEnded();
              this.cdr.markForCheck();
            });
          };

          this.isPlaying = true;
          this.isLoading = false;

          this.startTimeupdateInterval();
        }),
        map(() => true)
      );
    } else {
      return of(false);
    }
  }

  private stopPlaying(): Observable<boolean> {
    if (this.isPlaying) {
      this.isLoading = true;
      return this.audioService.stopAudio(this.source).pipe(
        tap(() => this.onPlayingEnded()),
        map(() => true)
      );
    } else {
      return of(false);
    }
  }

  private onPlayingEnded() {
    this.clearTimeupdateInterval();
    this.updateCurrentTime();
    this.isPlaying = false;
    this.isLoading = false;

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
      this.currentTime = this.startOffset + this.audioService.getPlayedTime(this.startAudioContextTime, this.source.playbackRate.value);
    } else {
      this.currentTime = this.startOffset;
    }

    const endTime = this.getEndTime();

    this.currentTime = Math.min(this.currentTime, endTime);

    if (this.currentTime === endTime && endTime !== this.buffer.duration) {
      this.stop();
    }
  }

  private getStartTime() {
    if (this.playArea?.xRange) {
      return this.playArea.xRange[0];
    } else {
      return 0;
    }
  }

  private getEndTime() {
    if (this.playArea?.xRange) {
      return this.playArea.xRange[1];
    } else {
      return this.buffer.duration;
    }
  }
}
