import { Injectable } from '@angular/core';
import { IGlobalRecordingWithAnnotation } from '../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../laji/src/app/shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LocalStorage } from 'ngx-webstorage';
import { Util } from '../../../../../laji/src/app/shared/service/util.service';

@Injectable({
  providedIn: 'root'
})
export class RecordingService {
  private previousLimit = 1; // how many previous recordings are kept in memory
  private nextLimit = 5; // how many next recordings are loaded to memory

  @LocalStorage('selected_sites') private selectedSites: number[];

  @LocalStorage('previous_recordings') private previous: number[];
  @LocalStorage('current_recording') private current: number|null;
  private next: number[];

  private dataByRecordingId: Record<number, IGlobalRecordingWithAnnotation> = {};

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private translate: TranslateService
  ) {
    if (!this.selectedSites) {
      this.selectedSites = [];
    }
    if (!this.previous) {
      this.previous = [];
    }
    if (this.current === undefined) {
      this.current = null;
    }
    if (!this.next) {
      this.next = [];
    }
  }

  setSelectedSites(selectedSites: number[]) {
    if (!Util.equalsArray(this.selectedSites, selectedSites)) {
      this.previous = [];
      this.current = null;
      this.next = [];
      this.clearUnusedData();
    }
    this.selectedSites = selectedSites;
  }

  hasPreviousRecording(): boolean {
    return this.previous.length > 0;
  }

  getCurrentRecording(): Observable<IGlobalRecordingWithAnnotation> {
    if (this.current !== null) {
      if (this.dataByRecordingId[this.current]) {
        return of(this.dataByRecordingId[this.current]);
      }
      return this.kerttuGlobalApi.getIdentificationRecording(this.userService.getToken(), this.translate.currentLang, this.current).pipe(
        tap(result => {
          this.dataByRecordingId[result.recording.id] = result;
        })
      );
    }

    const previousId = this.previous[this.previous.length - 1];
    return this.kerttuGlobalApi.getNewIdentificationRecording(
      this.userService.getToken(), this.translate.currentLang, this.selectedSites, previousId
    ).pipe(
      tap(result => {
        if (result.recording) {
          this.current = result.recording.id;
          this.dataByRecordingId[this.current] = result;
        }
      })
    );
  }

  getPreviousRecording(): Observable<IGlobalRecordingWithAnnotation> {
    this.next = [this.current, ...this.next];
    if (this.next.length > this.nextLimit) {
      this.next = this.next.slice(0, this.next.length - 1);
    }
    this.current = this.previous[this.previous.length - 1];
    this.previous = this.previous.slice(0, this.previous.length - 1);

    this.clearUnusedData();

    return this.getCurrentRecording();
  }

  getNextRecording(): Observable<IGlobalRecordingWithAnnotation> {
    this.previous = [...this.previous, this.current];
    if (this.previous.length > this.previousLimit) {
      this.previous = this.previous.slice(1);
    }
    this.current = this.next[0];
    this.next = this.next.slice(1);

    this.clearUnusedData();

    return this.getCurrentRecording();
  }

  private clearUnusedData() {
    const recordingIds = Object.keys(this.dataByRecordingId).map(recordingId => parseInt(recordingId, 10));
    const unusedIds = recordingIds.filter(recordingId => !(
      this.previous.includes(recordingId) || this.current === recordingId || this.next.includes(recordingId)
    ));
    for (const unusedId of unusedIds) {
      delete this.dataByRecordingId[unusedId];
    }
  }
}
