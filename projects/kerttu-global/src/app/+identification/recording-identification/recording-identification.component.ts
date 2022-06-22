import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, HostListener, OnDestroy } from '@angular/core';
import {
  IGlobalRecording,
  IGlobalRecordingAnnotation,
  IGlobalRecordingStatusInfo,
  IGlobalRecordingResponse,
  KerttuGlobalErrorEnum,
  IGlobalSite
} from '../../kerttu-global-shared/models';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../laji/src/app/shared/service/user.service';
import { map, switchMap } from 'rxjs/operators';
import { Util } from '../../../../../laji/src/app/shared/service/util.service';
import { DialogService } from '../../../../../laji/src/app/shared/service/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of, Subscription } from 'rxjs';
import equals from 'deep-equal';
import { ActivatedRoute, Router } from '@angular/router';
import { PersonApi } from '../../../../../laji/src/app/shared/api/PersonApi';
import { defaultAudioSampleRate } from '../../kerttu-global-shared/variables';

@Component({
  selector: 'bsg-recording-identification',
  templateUrl: './recording-identification.component.html',
  styleUrls: ['./recording-identification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordingIdentificationComponent implements OnInit, OnDestroy {
  sites$: Observable<IGlobalSite[]>;

  recording: IGlobalRecording;
  annotation: IGlobalRecordingAnnotation;
  statusInfo: IGlobalRecordingStatusInfo;

  expertiseMissing?: boolean;
  loading = false;
  hasUnsavedChanges = false;
  allRecordingsAnnotated = false;
  hasError = false;

  selectedSites?: number[];

  audioSampleRate = defaultAudioSampleRate;

  private originalAnnotation: IGlobalRecordingAnnotation;

  private expertiseMissingSub: Subscription;
  private siteIdsSub: Subscription;

  constructor(
    private kerttuGlobalApi: KerttuGlobalApi,
    private personService: PersonApi,
    private userService: UserService,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.sites$ = this.kerttuGlobalApi.getSites().pipe(
      map(result => result.results)
    );
  }

  ngOnInit() {
    this.expertiseMissingSub = this.personService.personFindProfileByToken(this.userService.getToken()).subscribe(profile => {
      this.expertiseMissing = !profile.birdwatchingActivityLevel || !profile.birdSongRecognitionSkillLevels?.length;
      this.cdr.markForCheck();
    });

    this.siteIdsSub = this.route.queryParams.pipe(
      map(data => (
        data['siteId'] || '').split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id))
      ),
    ).subscribe(siteIds => {
      this.selectedSites = siteIds;

      this.hasUnsavedChanges = false;
      this.allRecordingsAnnotated = false;
      this.hasError = false;

      if (this.selectedSites?.length > 0) {
        this.loading = true;
        this.kerttuGlobalApi.getRecording(this.userService.getToken(), siteIds).subscribe((result) => {
          this.onGetRecordingSuccess(result);
        }, (err) => {
          this.handleError(err);
        });
      }

      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.expertiseMissingSub?.unsubscribe();
    this.siteIdsSub?.unsubscribe();
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

  onSiteSelect(siteIds: number[]) {
    const queryParams = {};
    if (siteIds?.length > 0) {
      queryParams['siteId'] = siteIds.sort().join(',');
    }
    this.router.navigate([], {queryParams});
  }

  goBackToSiteSelection() {
    this.canDeactivate().subscribe(canDeactivate => {
      if (canDeactivate) {
        this.onSiteSelect([]);
      }
    });
  }

  getNextRecording(skipCurrent = false) {
    this.loading = true;
    this.kerttuGlobalApi.saveRecordingAnnotation(this.userService.getToken(), this.recording.id, this.annotation).pipe(
      switchMap(() => this.kerttuGlobalApi.getNextRecording(
        this.userService.getToken(), this.recording.id, this.selectedSites, skipCurrent
      ))
    ).subscribe(result => {
      this.onGetRecordingSuccess(result);
    }, (err) => {
      this.handleError(err);
    });
  }

  getPreviousRecording() {
    this.canDeactivate().subscribe(canDeactivate => {
      if (canDeactivate) {
        this.loading = true;
        this.kerttuGlobalApi.getPreviousRecording(this.userService.getToken(), this.recording.id, this.selectedSites).subscribe(result => {
          this.onGetRecordingSuccess(result);
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
    this.kerttuGlobalApi.saveRecordingAnnotation(this.userService.getToken(), this.recording.id, this.annotation).subscribe(() => {
      this.loading = false;
      this.originalAnnotation = Util.clone(this.annotation);
      this.hasUnsavedChanges = false;
      this.cdr.markForCheck();
    }, (err) => {
      this.handleError(err);
    });
  }

  onAnnotationChange() {
    this.hasUnsavedChanges = !equals(this.annotation, this.originalAnnotation);
  }

  private canSkip(): Observable<boolean> {
    if (this.isEmptyAnnotation(this.annotation)) {
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

  private onGetRecordingSuccess(data: IGlobalRecordingResponse) {
    this.loading = false;

    if (data.recording) {
      this.recording = data.recording;
      this.annotation = data.annotation || {};
      this.statusInfo = data.statusInfo;

      this.originalAnnotation = Util.clone(this.annotation);
      this.hasUnsavedChanges = false;
    } else {
      this.allRecordingsAnnotated = true;
    }

    this.cdr.markForCheck();
  }

  private handleError(err: any) {
    this.loading = false;

    const msg = KerttuGlobalApi.getErrorMessage(err);
    if (msg === KerttuGlobalErrorEnum.invalidRecordingAnnotation) {
      alert(this.translate.instant('identification.nextRecording.validation'));
    } else {
      this.hasError = true;
    }

    this.cdr.markForCheck();
  }
}
