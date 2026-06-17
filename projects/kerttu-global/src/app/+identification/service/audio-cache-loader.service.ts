import { Injectable } from '@angular/core';
import { AudioService } from '../../../../../laji/src/app/shared-modules/audio-viewer/service/audio.service';
import { getDefaultSampleRate } from '../../kerttu-global-shared/service/kerttu-global-utils';
import { Recording } from '../../kerttu-global-shared/models';
import { map } from 'rxjs';
import { Observable, of } from 'rxjs';

@Injectable()
export class AudioCacheLoaderService {
  constructor(
    private audioService: AudioService
  ) {}

  setCacheSize(cacheSize: number) {
    this.audioService.setBufferCacheSize(cacheSize);
  }

  loadAudioToCache(recording: Recording): Observable<boolean> {
    const sampleRate = getDefaultSampleRate(recording.taxonType);

    try {
      return this.audioService.getAudioBuffer(recording.url, sampleRate, recording.duration).pipe(map(() => true));
    } catch (e) {
      return of(false);
    }
  }

  removeAudioFromCache(recording: Recording) {
    this.audioService.removeFromCache(recording.url);
  }
}
