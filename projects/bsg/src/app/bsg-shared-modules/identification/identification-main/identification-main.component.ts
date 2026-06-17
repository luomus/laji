import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnChanges, Output } from '@angular/core';
import {
  Recording,
  RecordingAnnotation,
  RecordingWithAnnotation,
  BsgErrorEnum,
  TaxonomyListEnum,
  TaxonTypeEnum
} from '../../../bsg-shared/models';
import { switchMap } from 'rxjs';
import { Observable, of } from 'rxjs';
import * as Util from '../../../../../../laji/src/app/shared/utils';
import equals from 'deep-equal';
import { BsgApi } from '../../../bsg-shared/service/bsg-api';
import { NoRecordingsResult, RecordingLoaderService } from '../../../+identification/service/recording-loader.service';
import { UserService } from '../../../../../../laji/src/app/shared/service/user.service';
import { DialogService } from '../../../../../../laji/src/app/shared/service/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { AudioService } from '../../../../../../laji/src/app/shared-modules/audio-viewer/service/audio.service';
import { AudioCacheLoaderService } from '../../../+identification/service/audio-cache-loader.service';
import { getTranslateKeyWithTaxonType } from '../../../bsg-shared/pipe/translate-with-taxon-type.pipe';
import { getDefaultSelectableTaxonTypes } from '../../../bsg-shared/service/bsg-utils';

@Component({
    selector: 'bsg-identification-main',
    templateUrl: './identification-main.component.html',
    styleUrls: ['./identification-main.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [AudioService, AudioCacheLoaderService, RecordingLoaderService],
    standalone: false
})
export class IdentificationMainComponent implements OnChanges {
  @Input() selectedSites?: number[];
  @Input() selectedSpecies?: number[];
  @Input() unknownSpecies?: boolean;
  @Input() taxonomyList?: TaxonomyListEnum;
  @Input({ required: true }) goBackBtnLabel!: string;
  @Input({ required: true }) allRecordingsAnnotatedLabel!: string;

  recording?: Recording;
  annotation?: RecordingAnnotation;
  selectableTaxonTypes: TaxonTypeEnum[] = [];

  loading = false;
  hasUnsavedChanges = false;
  allRecordingsAnnotated = false;
  hasError = false;

  fileNameFilter = '';

  @Output() goBackClick = new EventEmitter<void>();

  private originalAnnotation?: RecordingAnnotation;

  constructor(
    public recordingLoaderService: RecordingLoaderService,
    private bsgApi: BsgApi,
    private userService: UserService,
    private dialogService: DialogService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges() {
    this.clearIdentificationState();
    this.recordingLoaderService.setSelectedSites(this.selectedSites);
    this.recordingLoaderService.setSelectedSpecies(this.selectedSpecies);
    this.recordingLoaderService.setUnknownSpecies(this.unknownSpecies);
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
    this.bsgApi.saveRecordingAnnotation(this.userService.getToken(), this.recording!.id, this.annotation!, false, skipCurrent).pipe(
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
    this.bsgApi.saveRecordingAnnotation(this.userService.getToken(), this.recording!.id, this.annotation!, true).subscribe(() => {
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

  private isEmptyAnnotation(annotation: RecordingAnnotation): boolean {
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

  private onGetRecordingsSuccess(data: RecordingWithAnnotation|NoRecordingsResult) {
    this.loading = false;
    this.clearIdentificationState();

    if (data.recording) {
      this.recording = data.recording;
      this.annotation = data.annotation || {};
      this.selectableTaxonTypes = getDefaultSelectableTaxonTypes(data.recording.taxonType);

      this.originalAnnotation = Util.clone(this.annotation);
    } else {
      this.allRecordingsAnnotated = true;
    }

    this.cdr.markForCheck();
  }

  private handleError(err: any) {
    this.loading = false;

    const msg = BsgApi.getErrorMessage(err);
    if (msg === BsgErrorEnum.invalidRecordingAnnotation) {
      this.dialogService.alert(this.translate.instant(
        getTranslateKeyWithTaxonType('identification.nextRecording.validation', this.recording?.taxonType)
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
