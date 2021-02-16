import {IAudioViewerArea} from '../models';
import {ChangeDetectorRef, NgZone} from '@angular/core';
import {AudioService} from './audio.service';
import {interval, Subscription, Observable, of} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

export class AudioPlayer {
  isPlaying = false;
  currentTime: number;

  loop = false;

  private buffer: AudioBuffer;
  private playArea: IAudioViewerArea;

  private source: AudioBufferSourceNode;
  private startOffset = 0;
  private startAudioContextTime: number;

  private autoplay = false;
  private autoplayRepeat = 1;
  private autoplayCounter = 0;

  private timeupdateInterval = interval(20);
  private timeupdateIntervalSub: Subscription;

  private resumingContext = false;

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

  toggle() {
    const obs: Observable<boolean> = this.isPlaying ? this.stopPlaying() : this.startPlaying();
    obs.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  stop() {
    this.stopPlaying().subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  startFrom(time: number) {
    this.stopPlaying().pipe(switchMap(() => {
      this.currentTime = time;
      return this.startPlaying();
    })).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  startAutoplay(times: number) {
    this.stopPlaying().pipe(switchMap(() => {
      this.autoplay = true;
      this.autoplayRepeat = times;
      this.autoplayCounter = 0;
      return this.startPlaying();
    })).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  clear() {
    this.clearTimeupdateInterval();

    if (this.source && this.isPlaying) {
      this.audioService.stopAudio(this.source).subscribe();
    }

    this.currentTime = undefined;
    this.isPlaying = false;
    this.source = undefined;
  }

  private startPlaying(): Observable<boolean> {
    if (!this.isPlaying && !this.resumingContext) {
      this.resumingContext = true;
      return this.audioService.resumeAudioContextIfSuspended().pipe(map(() => {
        this.resumingContext = false;

        this.isPlaying = true;
        if (!this.currentTime || this.currentTime >= this.getEndTime() || this.currentTime < this.getStartTime()) {
          this.currentTime = this.getStartTime();
        }
        this.startOffset = this.currentTime;

        this.source = this.audioService.playAudio(this.buffer, this.playArea?.yRange ? this.playArea.yRange : undefined, this.currentTime);
        this.startAudioContextTime = this.audioService.getAudioContextTime();

        this.source.onended = () => {
          this.ngZone.run(() => {
            this.onPlayingEnded();
            this.cdr.markForCheck();
          });
        };

        this.startTimeupdateInterval();
        return true;
      }));
    } else {
      return of(false);
    }
  }

  private stopPlaying(): Observable<boolean> {
    if (this.isPlaying && !this.resumingContext) {
      const source = this.source;
      this.onPlayingEnded();
      return this.audioService.stopAudio(source).pipe(
        map((event) => event != null)
      );
    } else {
      return of(false);
    }
  }

  private onPlayingEnded() {
    this.clearTimeupdateInterval();
    this.updateCurrentTime();
    this.isPlaying = false;

    const playingStoppedAutomatically = this.currentTime === this.getEndTime();
    if (this.autoplay && this.autoplayCounter < this.autoplayRepeat - 1) {
      if (playingStoppedAutomatically) {
        this.autoplayCounter += 1;
        this.toggle();
        return;
      } else {
        this.autoplayCounter = this.autoplayRepeat;
      }
    }
    if (this.loop && playingStoppedAutomatically) {
      this.toggle();
    }
  }

  private startTimeupdateInterval() {
    this.timeupdateIntervalSub = this.timeupdateInterval.subscribe(() => {
      this.updateCurrentTime();
      const endTime = this.getEndTime();
      if (this.currentTime === endTime && endTime !== this.buffer.duration) {
        this.stop();
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
    const playedTime = this.startOffset + this.audioService.getPlayedTime(this.startAudioContextTime, this.source.playbackRate.value);
    this.currentTime = Math.min(playedTime, this.getEndTime());
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
