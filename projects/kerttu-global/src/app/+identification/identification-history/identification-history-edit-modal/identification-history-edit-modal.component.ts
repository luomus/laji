import { ChangeDetectionStrategy, Component, OnInit, Input, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import {
  IGlobalRecording,
  IGlobalRecordingAnnotation,
  KerttuGlobalErrorEnum
} from '../../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../../laji/src/app/shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { AudioService } from '../../../../../../laji/src/app/shared-modules/audio-viewer/service/audio.service';
import { SpectrogramService } from '../../../../../../laji/src/app/shared-modules/audio-viewer/service/spectrogram.service';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { DialogService } from '../../../../../../laji/src/app/shared/service/dialog.service';

@Component({
  selector: 'bsg-identification-history-edit-modal',
  templateUrl: './identification-history-edit-modal.component.html',
  styleUrls: ['./identification-history-edit-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AudioService, SpectrogramService]
})
export class IdentificationHistoryEditModalComponent implements OnInit {
  @Input() recordingId!: number;

  recording: IGlobalRecording;
  annotation: IGlobalRecordingAnnotation;

  buttonsDisabled = false;

  @Output() modalClose = new EventEmitter<boolean>();

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private modalRef: BsModalRef,
    private dialogService: DialogService
  ) { }

  ngOnInit(): void {
    this.kerttuGlobalApi.getOldRecording(
      this.userService.getToken(), this.translate.currentLang, this.recordingId
    ).subscribe((result) => {
      this.recording = result.recording;
      this.annotation = result.annotation;
      this.cdr.markForCheck();
    });
  }

  saveAnnotation() {
    this.buttonsDisabled = true;
    this.kerttuGlobalApi.saveOldRecordingAnnotation(this.userService.getToken(), this.recording.id, this.annotation).subscribe({
      next: () => {
        this.close(true);
      },
      error: (err) => {
        const msg = KerttuGlobalApi.getErrorMessage(err);
        if (msg === KerttuGlobalErrorEnum.invalidRecordingAnnotation) {
          this.dialogService.alert(this.translate.instant('identification.nextRecording.validation'));
        } else {
          this.dialogService.alert(this.translate.instant('expertise.error'));
        }
        this.buttonsDisabled = false;
        this.cdr.markForCheck();
      }
    });
  }

  close(hasChanges = false) {
    this.modalClose.emit(hasChanges);
    this.modalRef.hide();
  }
}
