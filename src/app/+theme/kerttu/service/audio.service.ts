import { HttpClient } from '@angular/common/http';
import {Inject, Injectable, NgZone} from '@angular/core';
import { Observable, of } from 'rxjs';
import { share, switchMap, tap } from 'rxjs/operators';
import {WINDOW} from '@ng-toolkit/universal';

@Injectable()
export class AudioService {
  audioContext: AudioContext;

  private buffer$: { [url: string]: Observable<AudioBuffer> } = {};
  private buffer: { [url: string]: { buffer: AudioBuffer, time: number } } = {};

  private source: AudioBufferSourceNode;

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

  public extractSegment(buffer: AudioBuffer, startTime: number, endTime: number): AudioBuffer {
    const actualDuration = Math.floor(buffer.duration); // assume that the actual duration is in whole seconds
    const emptySamplesAtStart = buffer.length - actualDuration * buffer.sampleRate; // remove empty samples at start which are caused by the mp3 format

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

  public playAudio(buffer: AudioBuffer, frequencyRange: number[], startTime: number): AudioBufferSourceNode {
    if (this.source) {
      this.source.stop(0);
    }

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = buffer;

    if (frequencyRange) {
      const highpassFilter = this.createFilter('highpass', frequencyRange[0]);
      const lowpassFilter = this.createFilter('lowpass', frequencyRange[1]);
      this.source.connect(highpassFilter);
      highpassFilter.connect(lowpassFilter);
      lowpassFilter.connect(this.audioContext.destination);
    } else {
      this.source.connect(this.audioContext.destination);
    }

    this.source.start(0, startTime);
    return this.source;
  }

  public getTime() {
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
    while (keys.length > 2) {
      const times = keys.map(key => this.buffer[key].time);
      const removed = times.indexOf(Math.min(...times));
      keys.splice(removed, 1);
      delete this.buffer$[removed];
    }

    const newBuffer = {};
    for (const key of keys) {
      newBuffer[key] = this.buffer[key];
    }
    this.buffer = newBuffer;
  }
}
