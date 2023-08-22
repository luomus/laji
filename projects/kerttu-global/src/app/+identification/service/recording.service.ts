import { Injectable } from '@angular/core';
import { IGlobalRecordingWithAnnotation } from '../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../laji/src/app/shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LocalStorage } from 'ngx-webstorage';

@Injectable({
  providedIn: 'root'
})
export class RecordingService {
  private previousLimit = 1; // how many previous recordings are kept in memory
  private nextLimit = 5; // how many next recordings are loaded to memory

  private selectedSites: number[] = [];

  @LocalStorage('previous_recordings') private previous: IGlobalRecordingWithAnnotation[];
  @LocalStorage('current_recording') private current?: IGlobalRecordingWithAnnotation;
  @LocalStorage('next_recordings') private next: IGlobalRecordingWithAnnotation[];

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private translate: TranslateService
  ) {
    if (!this.previous) {
      this.previous = [];
    }
    if (!this.next) {
      this.next = [];
    }
  }

  setSelectedSites(selectedSites: number[]) {
    this.selectedSites = selectedSites;
  }

  hasPreviousRecording(): boolean {
    return this.previous.length > 0;
  }

  getCurrentRecording(): Observable<IGlobalRecordingWithAnnotation> {
    if (this.current) {
      return of(this.current);
    }
    return this.kerttuGlobalApi.getNewIdentificationRecording(this.userService.getToken(), this.translate.currentLang, this.selectedSites).pipe(
      tap(result => {
        this.current = result;
      })
    );
  }

  getPreviousRecording(): Observable<IGlobalRecordingWithAnnotation> {
    this.next = [this.current, ...this.next];
    if (this.next.length > this.nextLimit) {
      this.next = this.next.slice(0, this.next.length - 1);
    }
    this.current = this.previous.pop();

    return this.getCurrentRecording();
  }

  getNextRecording(): Observable<IGlobalRecordingWithAnnotation> {
    this.previous = [...this.previous, this.current];
    if (this.previous.length > this.previousLimit) {
      this.previous = this.previous.slice(1);
    }
    this.current = this.next.shift();

    return this.getCurrentRecording();
  }
}
