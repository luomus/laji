import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { IGlobalRecording, IGlobalRecordingAnnotation, IGlobalRecordingStatusInfo, IGlobalRecordingResponse, KerttuGlobalErrorEnum } from '../../kerttu-global-shared/models'
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../laji/src/app/shared/service/user.service';
import { switchMap } from 'rxjs/operators';
import { Util } from '../../../../../laji/src/app/shared/service/util.service';
import equals from 'deep-equal';
import { DialogService } from '../../../../../laji/src/app/shared/service/dialog.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'bsg-recording-identification',
  templateUrl: './recording-identification.component.html',
  styleUrls: ['./recording-identification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordingIdentificationComponent implements OnInit {
  recording: IGlobalRecording;
  annotation: IGlobalRecordingAnnotation;
  statusInfo: IGlobalRecordingStatusInfo;

  firstRecordingLoaded = false;
  loading = false;
  unsavedChanges = false;

  allRecordingsAnnotated = false;
  hasError = false;

  private originalAnnotation: IGlobalRecordingAnnotation;

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private dialogService: DialogService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loading = true;
    this.kerttuGlobalApi.getRecording(this.userService.getToken()).subscribe((result) => {
      this.onGetRecordingSuccess(result);
    }, (err) => {
      this.handleError(err);
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  preventLeave($event: any) {
    if (this.unsavedChanges) {
      $event.returnValue = false;
    }
  }

  canDeactivate() {
    if (!this.unsavedChanges) {
      return true;
    }
    return this.dialogService.confirm(this.translate.instant('theme.kerttu.recordingAnnotation.leaveConfirm'));
  }

  getNextRecording() {
    this.loading = true;
    this.kerttuGlobalApi.saveRecordingAnnotation(this.userService.getToken(), this.recording.id, this.annotation).pipe(
      switchMap(() => {
        return this.kerttuGlobalApi.getNextRecording(this.userService.getToken(), this.recording.id);
      })
    ).subscribe(result => {
      this.onGetRecordingSuccess(result);
    }, (err) => {
      this.handleError(err);
    });
  }

  getPreviousRecording() {
    this.kerttuGlobalApi.getPreviousRecording(this.userService.getToken(), this.recording.id).subscribe(result => {
      this.onGetRecordingSuccess(result);
    }, (err) => {
      this.handleError(err);
    });
  }

  save() {
    this.loading = true;
    const originalAnnotation = Util.clone(this.annotation);
    this.kerttuGlobalApi.saveRecordingAnnotation(this.userService.getToken(), this.recording.id, this.annotation).subscribe(() => {
      this.loading = false;
      this.originalAnnotation = originalAnnotation;
      this.onAnnotationChange();
      this.cdr.markForCheck();
    }, (err) => {
      this.handleError(err);
    });
  }

  onAnnotationChange() {
    this.unsavedChanges = !equals(this.annotation, this.originalAnnotation);
  }

  private onGetRecordingSuccess(data: IGlobalRecordingResponse) {
    this.loading = false;

    if (data.recording) {
      this.recording = data.recording;
      this.annotation = data.annotation || {};
      this.statusInfo = data.statusInfo;

      this.firstRecordingLoaded = true;
      this.originalAnnotation = Util.clone(this.annotation);
      this.onAnnotationChange();
    } else {
      this.allRecordingsAnnotated = true;
    }

    this.cdr.markForCheck();
  }

  private handleError(err: any) {
    this.loading = false;

    const msg = KerttuGlobalApi.getErrorMessage(err);
    if (msg === KerttuGlobalErrorEnum.invalidRecordingAnnotation) {
      alert(this.translate.instant('theme.kerttu.nextRecording.validation'));
    } else {
      this.hasError = true;
    }

    this.cdr.markForCheck();
  }
}
