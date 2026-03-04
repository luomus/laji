import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { Observable, of, Subscription, switchMap, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import {
  IdentificationMainComponent
} from '../../kerttu-global-shared-modules/identification/identification-main/identification-main.component';
import { map } from 'rxjs';
import { ComponentCanDeactivate } from '../../../../../laji/src/app/shared/guards/document-de-activate.guard';
import { Util } from '../../../../../laji/src/app/shared/service/util.service';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../laji/src/app/shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import { IGlobalRecording, IGlobalRecordingAnnotation, KerttuGlobalErrorEnum } from '../../kerttu-global-shared/models';
import { getTranslateKeyWithTaxonType } from '../../kerttu-global-shared/pipe/translate-with-taxon-type.pipe';
import { DialogService } from '../../../../../laji/src/app/shared/service/dialog.service';
import equals from 'deep-equal';

@Component({
    selector: 'bsg-xeno-canto-recording-identification',
    templateUrl: './xeno-canto-recording-identification.component.html',
    styleUrls: ['./xeno-canto-recording-identification.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class XenoCantoRecordingIdentificationComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(IdentificationMainComponent) identificationComponent?: IdentificationMainComponent;

  recording?: IGlobalRecording;
  annotation?: IGlobalRecordingAnnotation;

  saving = false;
  loading = false;
  hasError = false;

  private originalAnnotation?: IGlobalRecordingAnnotation;
  private hasUnsavedChanges = false;

  private recordingSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private translate: TranslateService,
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.recordingSub = this.route.params.pipe(
      tap(() => {
        this.recording = undefined;
        this.annotation = undefined;
        this.originalAnnotation = undefined;
        this.loading = true;
        this.hasError = false;
        this.hasUnsavedChanges = false;
      }),
      map(data => {
        const id = parseInt(data['id'] || '', 10);
        if (isNaN(id)) {
          throw new Error('Invalid recording id');
        }
        return id;
      }),
      switchMap(id => this.kerttuGlobalApi.getIdentificationXenoCantoRecording(
        this.userService.getToken(), this.translate.getCurrentLang(), id
      ))
  ).subscribe({
      next: (result) => {
        this.recording = result?.recording;
        this.annotation = result ? (result.annotation || {}) : undefined;
        this.originalAnnotation = Util.clone(this.annotation);
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.hasError = true;
        this.loading = false;
        this.cdr.markForCheck();
      },
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
    this.kerttuGlobalApi.saveRecordingAnnotation(this.userService.getToken(), this.recording!.id, this.annotation!).subscribe({
      next: () => {
        this.originalAnnotation = Util.clone(this.annotation);
        this.hasUnsavedChanges = false;
        this.saving = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        const msg = KerttuGlobalApi.getErrorMessage(err);
        if (msg === KerttuGlobalErrorEnum.invalidRecordingAnnotation) {
          this.dialogService.alert(this.translate.instant(
            getTranslateKeyWithTaxonType('identification.nextBirdRecording.validation', this.recording?.taxonType)
          ));
        } else {
          this.dialogService.alert(this.translate.instant('expertise.error'));
        }
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }

  onAnnotationChange() {
    this.hasUnsavedChanges = !equals(this.annotation, this.originalAnnotation);
  }
}
