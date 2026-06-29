import { ChangeDetectionStrategy, Component, Input, ChangeDetectorRef, EventEmitter, Output, OnDestroy, OnInit } from '@angular/core';
import {
  Recording,
  RecordingAnnotation,
  BsgErrorEnum,
  TaxonTypeEnum
} from '../../../../bsg-shared/models';
import { BsgApi } from '../../../../bsg-shared/service/bsg-api';
import { UserService } from '../../../../../../../laji/src/app/shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { AudioService } from '../../../../../../../laji/src/app/shared-modules/audio-viewer/service/audio.service';
import { SpectrogramService } from '../../../../../../../laji/src/app/shared-modules/audio-viewer/service/spectrogram.service';
import { DialogService } from '../../../../../../../laji/src/app/shared/service/dialog.service';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs';
import * as Util from '../../../../../../../laji/src/app/shared/utils';
import equals from 'deep-equal';
import { getTranslateKeyWithTaxonType } from '../../../../bsg-shared/pipe/translate-with-taxon-type.pipe';
import { getDefaultSelectableTaxonTypes } from '../../../../bsg-shared/service/bsg-utils';

@Component({
    selector: 'bsg-identification-history-edit-modal',
    templateUrl: './identification-history-edit-modal.component.html',
    styleUrls: ['./identification-history-edit-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [AudioService, SpectrogramService],
    standalone: false
})
export class IdentificationHistoryEditModalComponent implements OnInit, OnDestroy {
  @Input({ required: true }) index!: number;
  @Input({ required: true }) recordingId$!: Observable<number>;
  @Input({ required: true }) lastIndex!: number;

  recording?: Recording;
  annotation?: RecordingAnnotation;
  selectableTaxonTypes: TaxonTypeEnum[] = [];

  saving = false;
  loading = false;

  @Output() modalClose = new EventEmitter<boolean>();
  @Output() indexChange = new EventEmitter<number>();

  private originalAnnotation?: RecordingAnnotation;
  private hasUnsavedChanges = false;
  private hasChanges = false;

  private recordingSub?: Subscription;

  constructor(
    private bsgApi: BsgApi,
    private userService: UserService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    this.recordingSub = this.recordingId$.pipe(
      tap(() => {
        this.hasUnsavedChanges = false;
        this.loading = true;
      }),
      switchMap(recordingId => this.bsgApi.getIdentificationRecording(
        this.userService.getToken(), this.translate.getCurrentLang(), recordingId
      ))
    ).subscribe((result) => {
      this.recording = result.recording;
      this.annotation = result.annotation;
      this.selectableTaxonTypes = getDefaultSelectableTaxonTypes(result.recording?.taxonType);
      this.originalAnnotation = Util.clone(this.annotation);
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.recordingSub?.unsubscribe();
  }

  canDeactivate(): Observable<boolean> {
    if (!this.hasUnsavedChanges) {
      return of(true);
    }
    return this.dialogService.confirm(this.translate.instant('identification.leaveConfirm'));
  }

  saveAnnotation() {
    this.saving = true;
    this.bsgApi.saveRecordingAnnotation(this.userService.getToken(), this.recording!.id, this.annotation!).subscribe({
      next: () => {
        this.originalAnnotation = Util.clone(this.annotation);
        this.hasUnsavedChanges = false;
        this.hasChanges = true;
        this.saving = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        const msg = BsgApi.getErrorMessage(err);
        if (msg === BsgErrorEnum.invalidRecordingAnnotation) {
          this.dialogService.alert(this.translate.instant(
            getTranslateKeyWithTaxonType('identification.nextRecording.validation', this.recording?.taxonType)
          ));
        } else {
          this.dialogService.alert(this.translate.instant('expertise.error'));
        }
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  close() {
    this.canDeactivate().subscribe(canDeactivate => {
      if (canDeactivate) {
        this.modalClose.emit(this.hasChanges);
        this.cdr.markForCheck();
      }
    });
  }

  nextClick() {
    this.canDeactivate().subscribe(canDeactivate => {
      if (canDeactivate) {
        this.index++;
        this.indexChange.emit(this.index);
        this.cdr.markForCheck();
      }
    });
  }

  previousClick() {
    this.canDeactivate().subscribe(canDeactivate => {
      if (canDeactivate) {
        this.index--;
        this.indexChange.emit(this.index);
        this.cdr.markForCheck();
     }
    });
  }

  onAnnotationChange() {
    this.hasUnsavedChanges = !equals(this.annotation, this.originalAnnotation);
  }
}
