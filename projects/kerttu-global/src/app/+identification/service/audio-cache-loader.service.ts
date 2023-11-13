import { Injectable } from '@angular/core';
import { AudioService } from '../../../../../laji/src/app/shared-modules/audio-viewer/service/audio.service';
import { KerttuGlobalUtil } from '../../kerttu-global-shared/service/kerttu-global-util.service';
import { IGlobalRecording } from '../../kerttu-global-shared/models';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable()
export class AudioCacheLoaderService {
  constructor(
    private audioService: AudioService
  ) {}

  setCacheSize(cacheSize: number) {
    this.audioService.setCacheSize(cacheSize);
  }

  loadAudioToCache(recording: IGlobalRecording): Observable<boolean> {
    const sampleRate = KerttuGlobalUtil.getDefaultSampleRate(recording.taxonType);

    try {
      return this.audioService.getAudioBuffer(recording.url, recording.duration, sampleRate).pipe(map(() => true));
    } catch (e) {
      return of(false);
    }
  }

  removeAudioFromCache(recording: IGlobalRecording) {
    this.audioService.removeFromCache(recording.url);
  }
}

