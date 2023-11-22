import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, share, switchMap, tap } from 'rxjs/operators';
import { PlatformService } from '../../../root/platform.service';
import { AudioPlayer } from './audio-player';

@Injectable()
export class AudioService {
  private audioContext: AudioContext;

  private buffer$: { [url: string]: Observable<AudioBuffer> } = {};
  private buffer: { [url: string]: { buffer: AudioBuffer; time: number } } = {};

  private activePlayer: AudioPlayer;

  private resumeContext$: Observable<void>;

  private defaultSampleRate = 44100;
  private audioContextInitSampleRate?: number;
  private cacheSize = 3;

  constructor(
    private platformService: PlatformService,
    private httpClient: HttpClient,
    private ngZone: NgZone
  ) {}

  public setDefaultSampleRate(sampleRate: number): boolean {
    this.defaultSampleRate = sampleRate;
    try {
      this.getAudioContext();
      return true;
    } catch (e) {
      return false;
    }
  }

  public setCacheSize(cacheSize: number) {
    this.cacheSize = cacheSize;
  }

  public removeFromCache(url: string) {
    delete this.buffer$[url];
    delete this.buffer[url];
  }

  public getAudioBuffer(url: string, actualDuration?: number, sampleRate = this.defaultSampleRate): Observable<AudioBuffer> {
    const audioCtx = this.getNewOfflineAudioContext(sampleRate);

    if (this.buffer[url]) {
      this.buffer[url]['time'] = Date.now();
      return of(this.buffer[url]['buffer']);
    }

    if (!this.buffer$[url]) {
      const isWav = url.endsWith('.wav');
      this.buffer$[url] = (this.httpClient.get(url, {responseType: 'arraybuffer'}))
        .pipe(
          switchMap((response: ArrayBuffer) => {
            if (audioCtx.decodeAudioData.length === 2) { // for Safari
              return new Observable<AudioBuffer>(observer => {
                  audioCtx.decodeAudioData(response, (buffer) =>  {
                    this.ngZone.run(() => {
                      observer.next(buffer);
                      observer.complete();
                    });
                  });
                }
              );
            } else {
              return audioCtx.decodeAudioData(response);
            }
          }),
          map((buffer: AudioBuffer) => isWav ? buffer : this.removeEmptySamplesAtStart(buffer, actualDuration)),
          map(buffer => this.normaliseAudio(buffer)),
          tap(buffer => {
            this.buffer[url] = {
              buffer,
              time: Date.now()
            };
            this.removeOldBuffersFromCache();
          }),
          share()
        );
    }

    return this.buffer$[url];
  }

  public extractSegment(buffer: AudioBuffer, startTime: number, endTime: number): AudioBuffer {
    const startIdx = Math.max(Math.floor(startTime * buffer.sampleRate), 0);
    const endIdx = Math.min(Math.ceil(endTime * buffer.sampleRate), buffer.length - 1);

    return this.extract(buffer, startIdx, endIdx);
  }

  public normaliseAudio(buffer: AudioBuffer) {
    const audioCtx = this.getAudioContext();

    const resultBuffer = audioCtx.createBuffer(
      buffer.numberOfChannels,
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
    const audioCtx = this.getAudioContext();
    return audioCtx.state !== 'running';
  }

  public resumeAudioContext(): Observable<void> {
    const audioCtx = this.getAudioContext();
    if (!this.resumeContext$) {
      this.resumeContext$ = from(audioCtx.resume()).pipe(
        tap(() => this.resumeContext$ = null),
        share()
      );
    }
    return this.resumeContext$;
  }

  public playAudio(buffer: AudioBuffer, playbackRate: number, frequencyRange: number[], startTime: number, player: AudioPlayer): AudioBufferSourceNode {
    const audioCtx = this.getAudioContext();

    if (this.activePlayer && this.activePlayer !== player) {
      this.activePlayer.stop();
    }

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.5;
    source.connect(gainNode);

    const lastNode = this.addFrequencyFilters(gainNode, frequencyRange, buffer.sampleRate, playbackRate);
    lastNode.connect(audioCtx.destination);

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
    const audioCtx = this.getAudioContext();
    return audioCtx.currentTime;
  }

  public getPlayedTime(startTime: number, playbackRate: number) {
    return (this.getAudioContextTime() - startTime) * playbackRate;
  }

  private addFrequencyFilters(audioNode: AudioNode, frequencyRange: number[], sampleRate: number, playbackRate: number): AudioNode {
    const nbrOfFilters = 7; // the more filters there are the greater effect they have

    if (frequencyRange?.[0] > 0) {
      for (let i = 0; i < nbrOfFilters; i++) {
        const filter = this.createFilter('highpass', frequencyRange[0] * playbackRate);
        audioNode.connect(filter);
        audioNode = filter;
      }
    }
    if (frequencyRange?.[1] < sampleRate / 2) {
      for (let i = 0; i < nbrOfFilters; i++) {
        const filter = this.createFilter('lowpass', frequencyRange[1] * playbackRate);
        audioNode.connect(filter);
        audioNode = filter;
      }
    }

    return audioNode;
  }

  private createFilter(type: 'highpass'|'lowpass', frequency: number) {
    const audioCtx = this.getAudioContext();

    const filter = audioCtx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    return filter;
  }

  // remove empty samples at start which are caused by the mp3 format
  private removeEmptySamplesAtStart(buffer: AudioBuffer, actualDuration?: number) {
    if (!actualDuration) {
      return buffer;
    }
    const emptySamplesAtStart = buffer.length - actualDuration * buffer.sampleRate;
    return this.extract(buffer, emptySamplesAtStart, buffer.length - 1);
  }

  private extract(buffer: AudioBuffer, startIdx: number, endIdx: number) {
    const audioCtx = this.getAudioContext();

    const emptySegment = audioCtx.createBuffer(
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

  private removeOldBuffersFromCache() {
    const keys = Object.keys(this.buffer);
    while (keys.length > this.cacheSize) {
      const times = keys.map(key => this.buffer[key].time);
      const removed = times.indexOf(Math.min(...times));
      const removedKey = keys[removed];

      this.removeFromCache(removedKey);

      keys.splice(removed, 1);
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext || this.defaultSampleRate !== this.audioContextInitSampleRate) {
      this.audioContextInitSampleRate = this.defaultSampleRate;
      const window = this.platformService.window;
      this.audioContext = new (window['AudioContext'] || window['webkitAudioContext'])({
        sampleRate: this.defaultSampleRate
      });
    }
    return this.audioContext;
  }

  private getNewOfflineAudioContext(sampleRate: number): OfflineAudioContext {
    const window = this.platformService.window;
    return new (window['OfflineAudioContext'] || window['webkitOfflineAudioContext'])(1, 1, sampleRate);
  }
}
