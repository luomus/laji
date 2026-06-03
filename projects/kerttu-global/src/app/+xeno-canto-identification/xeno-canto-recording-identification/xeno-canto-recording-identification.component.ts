import {
  Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy, OutputRefSubscription, ViewChild,
  TemplateRef
} from '@angular/core';
import { catchError, Observable, of, Subscription, switchMap, tap, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import {
  IdentificationMainComponent
} from '../../kerttu-global-shared-modules/identification/identification-main/identification-main.component';
import { map } from 'rxjs';
import { ComponentCanDeactivate } from '../../../../../laji/src/app/shared/guards/document-de-activate.guard';
import { clone } from '../../../../../laji/src/app/shared/utils';
import { KerttuGlobalApi } from '../../kerttu-global-shared/service/kerttu-global-api';
import { UserService } from '../../../../../laji/src/app/shared/service/user.service';
import { TranslateService } from '@ngx-translate/core';
import {
  IGlobalRecording,
  IGlobalRecordingAnnotation, ISuccessResult,
  KerttuGlobalErrorEnum, TaxonomyListEnum
} from '../../kerttu-global-shared/models';
import { getTranslateKeyWithTaxonType } from '../../kerttu-global-shared/pipe/translate-with-taxon-type.pipe';
import { DialogService } from '../../../../../laji/src/app/shared/service/dialog.service';
import { ModalRef, ModalService } from '../../../../../laji-ui/src/lib/modal/modal.service';
import {
  XenoCantoExportFormComponent,
  XenoCantoExportFormResult
} from '../xeno-canto-export-form/xeno-canto-export-form.component';
import equals from 'deep-equal';
import { LajiApiClientBService } from '../../../../../laji-api-client-b/src/laji-api-client-b.service';

const xenoCantoApiKeyMissingError = 'Xeno-Canto API key missing';

@Component({
    selector: 'bsg-xeno-canto-recording-identification',
    templateUrl: './xeno-canto-recording-identification.component.html',
    styleUrls: ['./xeno-canto-recording-identification.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class XenoCantoRecordingIdentificationComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  @ViewChild(IdentificationMainComponent) identificationComponent?: IdentificationMainComponent;
  @ViewChild('noApiKeyTpl', { static: true }) noApiKeyTpl!: TemplateRef<any>;
  @ViewChild('invalidApiKeyTpl', { static: true }) invalidApiKeyTpl!: TemplateRef<any>;

  recording?: IGlobalRecording;
  annotation?: IGlobalRecordingAnnotation;
  taxonomyList = TaxonomyListEnum.xenoCanto;

  saving = false;
  loading = false;
  loadingXenoCantoApiKey = false;
  hasError = false;
  hasUnsavedChanges = false;

  private originalAnnotation?: IGlobalRecordingAnnotation;

  private recordingSub?: Subscription;
  private exportModalRef?: ModalRef<XenoCantoExportFormComponent>;
  private exportModalSub?: OutputRefSubscription;

  constructor(
    private route: ActivatedRoute,
    private kerttuGlobalApi: KerttuGlobalApi,
    private userService: UserService,
    private translate: TranslateService,
    private dialogService: DialogService,
    private modalService: ModalService,
    private api: LajiApiClientBService,
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
        this.originalAnnotation = clone(this.annotation);
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
    this.exportModalSub?.unsubscribe();
  }

  openExportModal() {
    const apiKey$ = this.hasUnsavedChanges
      ? this.doSave().pipe(switchMap(() => this.getXenoCantoApiKey()))
      : this.getXenoCantoApiKey();

    apiKey$.subscribe({
      next: () => {
        this.exportModalSub?.unsubscribe();

        this.exportModalRef = this.modalService.show(XenoCantoExportFormComponent, {
          size: 'lg',
          initialState: { siteId: this.recording?.site?.id },
        });

        this.exportModalSub = this.exportModalRef.content!.submitForm.subscribe((data: XenoCantoExportFormResult) => {
          this.exportToXenoCanto(data);
        });

        this.cdr.markForCheck();
      },
      error: (err) => {
        if (err?.message === xenoCantoApiKeyMissingError) {
          this.api.flush('/person/profile');
          this.dialogService.alert(this.noApiKeyTpl);
        } else {
          this.dialogService.alert(this.translate.instant('identification.genericError'));
        }

        this.cdr.markForCheck();
      }
    });
  }

  canDeactivate(): Observable<boolean> {
    if (!this.hasUnsavedChanges) {
      return of(true);
    }
    return this.dialogService.confirm(this.translate.instant('identification.leaveConfirm'));
  }

  saveAnnotation() {
    this.doSave().subscribe();
  }

  onAnnotationChange() {
    this.hasUnsavedChanges = !equals(this.annotation, this.originalAnnotation);
  }

  private doSave(): Observable<ISuccessResult> {
    this.saving = true;

    return this.kerttuGlobalApi.saveRecordingAnnotation(this.userService.getToken(), this.recording!.id, this.annotation!).pipe(
      tap(() => {
        this.originalAnnotation = clone(this.annotation);
        this.hasUnsavedChanges = false;
        this.saving = false;
        this.cdr.markForCheck();
      }),
      catchError((err) => {
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
        return throwError(() => err);
      })
    );
  }

  private getXenoCantoApiKey(): Observable<string> {
    this.loadingXenoCantoApiKey = true;

    return this.api.get('/person/profile').pipe(
      map(profile => profile.xenoCantoApiKey),
      map((xenoCantoApiKey) => {
        if (!xenoCantoApiKey) {
          throw new Error(xenoCantoApiKeyMissingError);
        }

        this.loadingXenoCantoApiKey = false;
        this.cdr.markForCheck();

        return xenoCantoApiKey;
      }),
      catchError((err) => {
        this.loadingXenoCantoApiKey = false;
        this.cdr.markForCheck();

        return throwError(err);
      })
    );
  }

  private exportToXenoCanto(data: XenoCantoExportFormResult) {
    this.exportModalRef!.content!.exportLoading.set(true);

    this.performExport(data).subscribe({
      next: () => {
        this.exportModalRef!.hide();
        this.dialogService.alert(this.translate.instant('xenoCantoExport.success'));

        this.exportModalRef!.content!.exportLoading.set(false);
        this.cdr.markForCheck();
      },
      error: (err) => {
        if (err?.message === xenoCantoApiKeyMissingError) {
          this.api.flush('/person/profile');
          this.dialogService.alert(this.noApiKeyTpl);
        } else {
          const msg = KerttuGlobalApi.getErrorMessage(err);
          if (msg === KerttuGlobalErrorEnum.invalidXenoCantoApiKey) {
            this.api.flush('/person/profile');
            this.dialogService.alert(this.invalidApiKeyTpl);
          } else {
            this.dialogService.alert(this.translate.instant('xenoCantoExport.error'));
          }
        }

        this.exportModalRef!.content!.exportLoading.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  private performExport(data: XenoCantoExportFormResult): Observable<ISuccessResult> {
    return this.getXenoCantoApiKey().pipe(
      switchMap(
        (apiKey) => this.kerttuGlobalApi.exportToXenoCanto(this.userService.getToken(), apiKey, data)
      )
    );
  }
}
