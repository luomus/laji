import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, Output } from '@angular/core';
import {
  IGlobalRecording,
  IGlobalRecordingAnnotation,
  IGlobalRecordingWithAnnotation,
  KerttuGlobalErrorEnum
} from '../../../kerttu-global-shared/models';
import { switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Util } from '../../../../../../laji/src/app/shared/service/util.service';
import equals from 'deep-equal';
import { KerttuGlobalApi } from '../../../kerttu-global-shared/service/kerttu-global-api';
import { NoRecordingsResult, RecordingLoaderService } from '../../../+identification/service/recording-loader.service';
import { UserService } from '../../../../../../laji/src/app/shared/service/user.service';
import { DialogService } from '../../../../../../laji/src/app/shared/service/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { AudioService } from '../../../../../../laji/src/app/shared-modules/audio-viewer/service/audio.service';
import { AudioCacheLoaderService } from '../../../+identification/service/audio-cache-loader.service';
import { IdentificationNavComponent } from './identification-nav/identification-nav.component';
import { IdentificationViewComponent } from './identification-view/identification-view.component';
import { NgIf } from '@angular/common';
import { LajiUiModule } from '../../../../../../laji-ui/src/lib/laji-ui.module';
import { getTranslateKeyWithTaxonType } from '../../../kerttu-global-shared/pipe/translate-with-taxon-type.pipe';

@Component({
  selector: 'bsg-identification-main',
  templateUrl: './identification-main.component.html',
  styleUrls: ['./identification-main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AudioService, AudioCacheLoaderService, RecordingLoaderService]
})
export class IdentificationMainComponent implements OnChanges {
  @Input() selectedSites?: number[];
  @Input() selectedSpecies?: number[];
  @Input({ required: true }) goBackBtnLabel!: string;
  @Input({ required: true }) allRecordingsAnnotatedLabel!: string;

  recording?: IGlobalRecording;
  annotation?: IGlobalRecordingAnnotation;

  loading = false;
  hasUnsavedChanges = false;
  allRecordingsAnnotated = false;
  hasError = false;

  fileNameFilter = '';

  @Output() goBackClick = new EventEmitter<void>();

  private originalAnnotation?: IGlobalRecordingAnnotation;

  constructor(
    public recordingLoaderService: RecordingLoaderService,
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private dialogService: DialogService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges() {
    this.clearIdentificationState();
    this.recordingLoaderService.setSelectedSites(this.selectedSites);
    this.recordingLoaderService.setSelectedSpecies(this.selectedSpecies);
    this.loadCurrentRecording();
  }

  @HostListener('window:beforeunload', ['$event'])
  preventLeave($event: any) {
    if (this.hasUnsavedChanges) {
      $event.returnValue = false;
    }
  }
  canDeactivate(): Observable<boolean> {
    if (!this.hasUnsavedChanges) {
      return of(true);
    }
    return this.dialogService.confirm(this.translate.instant('identification.leaveConfirm'));
  }

  onGoBackClick() {
    this.canDeactivate().subscribe(canDeactivate => {
      if (canDeactivate) {
        this.goBackClick.emit();
      }
    });
  }

  getNextRecording(skipCurrent = false) {
    this.loading = true;
    this.kerttuGlobalApi.saveRecordingAnnotation(this.userService.getToken(), this.recording!.id, this.annotation!, false, skipCurrent).pipe(
      switchMap(() => this.recordingLoaderService.getNextRecording())
    ).subscribe(result => {
      this.onGetRecordingsSuccess(result);
    }, (err) => {
      this.handleError(err);
    });
  }

  getPreviousRecording() {
    this.canDeactivate().subscribe(canDeactivate => {
      if (canDeactivate) {
        this.loading = true;
        this.recordingLoaderService.getPreviousRecording().subscribe(result => {
          this.onGetRecordingsSuccess(result);
        }, (err) => {
          this.handleError(err);
        });
      }
      this.cdr.markForCheck();
    });
  }

  skipRecording() {
    this.canSkip().subscribe(canSkip => {
      if (canSkip) {
        this.getNextRecording(true);
      }
      this.cdr.markForCheck();
    });
  }

  save() {
    this.loading = true;
    this.kerttuGlobalApi.saveRecordingAnnotation(this.userService.getToken(), this.recording!.id, this.annotation!, true).subscribe(() => {
      this.loading = false;
      this.originalAnnotation = Util.clone(this.annotation);
      this.hasUnsavedChanges = false;
      this.cdr.markForCheck();
    }, (err) => {
      this.handleError(err);
    });
  }

  onAnnotationChange() {
    this.recordingLoaderService.setCurrentAnnotation(this.annotation!);
    this.hasUnsavedChanges = !equals(this.annotation, this.originalAnnotation);
  }

  onFileNameFilterChange(fileNameFilter: string) {
    this.recordingLoaderService.setFileNameFilter(fileNameFilter);
    if (this.allRecordingsAnnotated) {
      this.loadCurrentRecording();
    }
  }

  private loadCurrentRecording() {
    this.loading = true;
    this.recordingLoaderService.getCurrentRecording().subscribe((result) => {
      this.onGetRecordingsSuccess(result);
    }, (err) => {
      this.handleError(err);
    });
  }

  private canSkip(): Observable<boolean> {
    if (this.isEmptyAnnotation(this.annotation!)) {
      return of(true);
    }
    return this.dialogService.confirm(
      this.translate.instant('identification.skipConfirm')
    );
  }

  private isEmptyAnnotation(annotation: IGlobalRecordingAnnotation): boolean {
    return (
      !annotation.birdsNotOnList &&
      !annotation.containsBirdsNotOnList &&
      !annotation.containsHumanSpeech &&
      !annotation.containsUnknownBirds &&
      !annotation.doesNotContainBirds &&
      !annotation.hasBoxesForAllBirdSounds &&
      !annotation.isLowQuality &&
      !annotation.nonBirdArea &&
      !annotation.speciesAnnotations?.length
    );
  }

  private onGetRecordingsSuccess(data: IGlobalRecordingWithAnnotation|NoRecordingsResult) {
    this.loading = false;
    this.clearIdentificationState();

    if (data.recording) {
      this.recording = data.recording;
      this.annotation = data.annotation || {};

      this.originalAnnotation = Util.clone(this.annotation);
    } else {
      this.allRecordingsAnnotated = true;
    }

    this.cdr.markForCheck();
  }

  private handleError(err: any) {
    this.loading = false;

    const msg = KerttuGlobalApi.getErrorMessage(err);
    if (msg === KerttuGlobalErrorEnum.invalidRecordingAnnotation) {
      this.dialogService.alert(this.translate.instant(
        getTranslateKeyWithTaxonType('identification.nextBirdRecording.validation', this.recording?.taxonType)
      ));
    } else {
      this.hasError = true;
    }

    this.cdr.markForCheck();
  }

  private clearIdentificationState() {
    this.recording = undefined;
    this.annotation = undefined;

    this.hasUnsavedChanges = false;
    this.allRecordingsAnnotated = false;
    this.hasError = false;
  }
}
