import { Injectable } from '@angular/core';
import { IGlobalRecordingWithAnnotation } from '../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../laji/src/app/shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { switchMap, tap, share, take, map } from 'rxjs/operators';
import { LocalStorage } from 'ngx-webstorage';
import { Util } from '../../../../../laji/src/app/shared/service/util.service';
import { AudioCacheLoaderService } from './audio-cache-loader.service';

@Injectable()
export class RecordingService {
  private previousLimit = 1; // how many previous recordings are kept in memory
  private nextLimit = 5; // how many next recordings are loaded to memory

  @LocalStorage('selected_sites') private selectedSites: number[];

  @LocalStorage('previous_recordings') private previous: number[];
  @LocalStorage('current_recording') private current: number|null;
  private next: number[] = [];

  private dataByRecordingId: Record<number, IGlobalRecordingWithAnnotation> = {};

  private preloadNextRecordingIsActive = false;
  private preloadNextRecordingSubject = new Subject<number>();
  private preloadNextRecording$: Observable<IGlobalRecordingWithAnnotation>;
  private preloadNextRecordingSub: Subscription;

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private translate: TranslateService,
    private audioCacheLoader: AudioCacheLoaderService
  ) {
    this.audioCacheLoader.setCacheSize(this.previousLimit + this.nextLimit + 1);
    this.initLocalStorageValues();
    this.initPreloadNextRecordings();
  }

  setSelectedSites(selectedSites: number[]) {
    if (!Util.equalsArray(this.selectedSites, selectedSites)) {
      this.previous = [];
      this.current = null;
      this.next = [];
      this.pruneCache();
    }
    this.selectedSites = selectedSites;
  }

  hasPreviousRecording(): boolean {
    return this.previous.length > 0;
  }

  getCurrentRecording(): Observable<IGlobalRecordingWithAnnotation> {
    if (this.current !== null) {
      let data$: Observable<IGlobalRecordingWithAnnotation>;

      if (this.dataByRecordingId[this.current]) {
        data$ = of(this.dataByRecordingId[this.current]);
      } else {
        data$ = this.kerttuGlobalApi.getIdentificationRecording(this.userService.getToken(), this.translate.currentLang, this.current).pipe(
          tap(result => {
            this.dataByRecordingId[result.recording.id] = result;
          })
        );
      }

      return data$.pipe(tap(() => this.startPreloadingRecordings()));
    }

    this.startPreloadingRecordings();
    return this.preloadNextRecording$.pipe(take(1));
  }

  getPreviousRecording(): Observable<IGlobalRecordingWithAnnotation> {
    this.next = [this.current, ...this.next];
    if (this.next.length > this.nextLimit) {
      this.next = this.next.slice(0, this.next.length - 1);
    }
    this.current = this.undefinedToNull(this.previous[this.previous.length - 1]);
    this.previous = this.previous.slice(0, this.previous.length - 1);

    this.pruneCache();

    return this.getCurrentRecording();
  }

  getNextRecording(): Observable<IGlobalRecordingWithAnnotation> {
    this.previous = [...this.previous, this.current];
    if (this.previous.length > this.previousLimit) {
      this.previous = this.previous.slice(1);
    }
    const nextValue = this.next[0];
    this.current = this.undefinedToNull(nextValue);
    this.next = this.next.slice(1);

    this.pruneCache();

    if (nextValue === null) {
      return of({ recording: null, annotation: null });
    }

    return this.getCurrentRecording();
  }

  private initLocalStorageValues() {
    if (!this.selectedSites) {
      this.selectedSites = [];
    }
    if (!this.previous) {
      this.previous = [];
    }
    if (this.current === undefined) {
      this.current = null;
    }
  }

  private initPreloadNextRecordings() {
    this.preloadNextRecording$ = this.preloadNextRecordingSubject.pipe(
      switchMap(previousId => {
        const excludedIds = this.current != null ? [this.current, ...this.next] : [...this.next];
        return this.kerttuGlobalApi.getNewIdentificationRecording(
          this.userService.getToken(), this.translate.currentLang, this.selectedSites, previousId, excludedIds
        );
      }),
      tap(result => {
        const recordingId = this.undefinedToNull(result.recording?.id);
        if (this.current === null) {
          this.current = recordingId;
        } else {
          this.next.push(recordingId);
        }

        if (result.recording) {
          this.dataByRecordingId[recordingId] = result;

          this.audioCacheLoader.loadAudioToCache(result.recording).subscribe(() => {
            if (this.next.length < this.nextLimit) {
              this.preloadNextRecordingSubject.next(recordingId);
            } else {
              this.preloadNextRecordingIsActive = false;
            }
          });
        } else {
          this.preloadNextRecordingIsActive = false;
        }
      }),
      share()
    );

    this.preloadNextRecordingSub = this.preloadNextRecording$.subscribe();
  }

  private startPreloadingRecordings() {
    if (!this.preloadNextRecordingIsActive && this.next.length < this.nextLimit) {
      const previousRecordingId = this.current === null ? this.previous[this.previous.length - 1] :
        (this.next.length === 0 ? this.current : this.next[this.next.length - 1]);
      this.preloadNextRecordingSubject.next(previousRecordingId);
      this.preloadNextRecordingIsActive = true;
    }
  }

  private pruneCache() {
    const recordingIds = Object.keys(this.dataByRecordingId).map(recordingId => parseInt(recordingId, 10));
    const unusedIds = recordingIds.filter(recordingId => !(
      this.previous.includes(recordingId) || this.current === recordingId || this.next.includes(recordingId)
    ));
    for (const unusedId of unusedIds) {
      if (this.dataByRecordingId[unusedId]) {
        this.audioCacheLoader.removeAudioFromCache(this.dataByRecordingId[unusedId].recording);
        delete this.dataByRecordingId[unusedId];
      }
    }
  }

  private undefinedToNull(value?: number) {
    return value === undefined ? null : value;
  }
}
