import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, NgZone } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { share, switchMap, tap } from 'rxjs/operators';
import { WINDOW } from '@ng-toolkit/universal';
import { AudioPlayer } from './audio-player';

@Injectable()
export class AudioService {
  private audioContext: AudioContext;

  private buffer$: { [url: string]: Observable<AudioBuffer> } = {};
  private buffer: { [url: string]: { buffer: AudioBuffer, time: number } } = {};

  private activePlayer: AudioPlayer;

  private resumeContext$: Observable<void>;

  constructor(
    @Inject(WINDOW) private window: Window,
    private httpClient: HttpClient,
    private ngZone: NgZone
  ) {
    try {
      this.audioContext = new (this.window['AudioContext'] || this.window['webkitAudioContext'])();
    } catch (e) {
    }
  }

  public getAudioBuffer(url: string): Observable<AudioBuffer> {
    if (this.buffer[url]) {
      this.buffer[url]['time'] = Date.now();
      return of(this.buffer[url]['buffer']);
    }

    if (!this.buffer$[url]) {
      this.buffer$[url] = this.httpClient.get(url, {responseType: 'arraybuffer'})
        .pipe(
          switchMap((response: ArrayBuffer) => {
            if (this.audioContext.decodeAudioData.length === 2) { // for Safari
              return new Observable(observer => {
                  this.audioContext.decodeAudioData(response, (buffer) =>  {
                    this.ngZone.run(() => {
                      observer.next(buffer);
                      observer.complete();
                    });
                  });
                }
              );
            } else {
              return this.audioContext.decodeAudioData(response);
            }
          }),
          tap((buffer: AudioBuffer) => {
            this.buffer[url] = {
              'buffer': buffer,
              'time': Date.now()
            };
            this.removeOldBuffersFromCache();
          }),
          share()
        );
    }

    return this.buffer$[url];
  }

  public extractSegment(buffer: AudioBuffer, startTime: number, endTime: number, actualDuration?: number): AudioBuffer {
        // remove empty samples at start which are caused by the mp3 format
    const emptySamplesAtStart = actualDuration ? buffer.length - actualDuration * buffer.sampleRate : 0;

    const startIdx = Math.max(Math.floor(startTime * buffer.sampleRate) + emptySamplesAtStart, emptySamplesAtStart);
    const endIdx = Math.min(Math.ceil(endTime * buffer.sampleRate) + emptySamplesAtStart, buffer.length - 1);

    const emptySegment = this.audioContext.createBuffer(
      buffer.numberOfChannels,
      endIdx - startIdx + 1,
      buffer.sampleRate
    );
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const chanData = buffer.getChannelData(i);
      const segmentChanData = emptySegment.getChannelData(i);

      for (let j = startIdx; j <= endIdx; j++) {
        segmentChanData[j - startIdx] = chanData[j];
      }
    }

    return emptySegment;
  }

  public normaliseAudio(buffer: AudioBuffer) {
    const resultBuffer = this.audioContext.createBuffer(
      1,
      buffer.length,
      buffer.sampleRate
    );

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const chanData = buffer.getChannelData(i);

      let max = 0;
      chanData.forEach((value) => {
        const absValue = Math.abs(value);
        if (absValue > max) {
          max = absValue;
        }
      });

      const resultChanData = resultBuffer.getChannelData(i);
      for (let j = 0; j < chanData.length; j++) {
        resultChanData[j] = chanData[j] * (1 / max);
      }
    }
    return resultBuffer;
  }

  public audioContextIsSuspended(): boolean {
    return this.audioContext.state !== 'running';
  }

  public resumeAudioContext(): Observable<void> {
    if (!this.resumeContext$) {
      this.resumeContext$ = from(this.audioContext.resume()).pipe(
        tap(() => this.resumeContext$ = null),
        share()
      );
    }
    return this.resumeContext$;
  }

  public playAudio(buffer: AudioBuffer, frequencyRange: number[], startTime: number, player: AudioPlayer): AudioBufferSourceNode {
    if (this.activePlayer && this.activePlayer !== player) {
      this.activePlayer.stop();
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    if (frequencyRange) {
      const highpassFilter = this.createFilter('highpass', frequencyRange[0]);
      const lowpassFilter = this.createFilter('lowpass', frequencyRange[1]);
      source.connect(highpassFilter);
      highpassFilter.connect(lowpassFilter);
      lowpassFilter.connect(this.audioContext.destination);
    } else {
      source.connect(this.audioContext.destination);
    }
    source.start(0, startTime);
    this.activePlayer = player;
    return source;
  }

  public stopAudio(source: AudioBufferSourceNode) {
    try {
      source.stop(0);
    } catch (e) {}
  }

  public getAudioContextTime() {
    return this.audioContext.currentTime;
  }

  public getPlayedTime(startTime: number, playbackRate: number) {
    return (this.audioContext.currentTime - startTime) * playbackRate;
  }

  private createFilter(type: 'highpass'|'lowpass', frequency: number) {
    const filter = this.audioContext.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    return filter;
  }

  private removeOldBuffersFromCache() {
    const keys = Object.keys(this.buffer);
    while (keys.length > 3) {
      const times = keys.map(key => this.buffer[key].time);
      const removed = times.indexOf(Math.min(...times));
      const removedKey = keys[removed];

      delete this.buffer$[removedKey];
      delete this.buffer[removedKey];

      keys.splice(removed, 1);
    }
  }
}
