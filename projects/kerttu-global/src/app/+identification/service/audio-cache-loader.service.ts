import { Injectable } from '@angular/core';
import { AudioService } from '../../../../../laji/src/app/shared-modules/audio-viewer/service/audio.service';
import { IAudio } from '../../../../../laji/src/app/shared-modules/audio-viewer/models';

@Injectable()
export class AudioCacheLoaderService {
  constructor(
    private audioService: AudioService
  ) {}

  setCacheSize(cacheSize: number) {
    this.audioService.setCacheSize(cacheSize);
  }

  loadAudioToCache(audio: IAudio) {
    return this.audioService.getAudioBuffer(audio.url, audio.duration);
  }
}

