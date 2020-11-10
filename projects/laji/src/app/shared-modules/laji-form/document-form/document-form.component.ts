import { mergeMap, switchMap, take, tap } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { FooterService } from '../../../shared/service/footer.service';
import { LajiFormComponent } from '../laji-form/laji-form.component';
import { ToastsService } from '../../../shared/service/toasts.service';
import { Document } from '../../../shared/model/Document';
import { DialogService } from '../../../shared/service/dialog.service';
import { ComponentCanDeactivate } from '../../../shared/guards/document-de-activate.guard';
import { FormError, FormWithData, ILajiFormState, ISuccessEvent, LajiFormDocumentFacade } from '../laji-form-document.facade';
import { DocumentApi } from '../../../shared/api/DocumentApi';
import { TemplateForm } from '../../own-submissions/models/template-form';
import { DocumentService } from '../../own-submissions/service/document.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { LatestDocumentsFacade } from '../../latest-documents/latest-documents.facade';
import { PlatformService } from '../../../shared/service/platform.service';

@Component({
  selector: 'laji-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormComponent implements OnChanges, OnDestroy, ComponentCanDeactivate {
  @ViewChild(LajiFormComponent) lajiForm: LajiFormComponent;
  @ViewChild('saveAsTemplate', { static: true }) public templateModal: ModalDirective;
  @Input() formId: string;
  @Input() documentId: string;
  @Input() showHeader = true;
  @Input() showShortcutButton = true;
  @Input() template = false;
  @Output() success = new EventEmitter<ISuccessEvent>();
  @Output() error = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() accessDenied = new EventEmitter();
  @Output() missingNamedplace = new EventEmitter();
  event: EventEmitter<any> = new EventEmitter();

  errors = FormError;
  hasAlertContent = false;
  form: FormWithData;
  lang: string;
  status = '';
  saveVisibility = 'hidden';
  isAdmin = false;
  isFromCancel = false;
  validationErrors: any;
  touchedCounter = 0;
  templateForm: TemplateForm = {
    name: '',
    description: '',
    type: 'gathering'
  };
  tmpDocument: any = {};

  private subErrors: Subscription;
  private subSaving: Subscription;
  private leaveMsg;
  private publicityRestrictions;
  private formSubscription: Subscription;

  vm$: Observable<ILajiFormState>;

  constructor(private lajiFormFacade: LajiFormDocumentFacade,
              private footerService: FooterService,
              public translate: TranslateService,
              private toastsService: ToastsService,
              private dialogService: DialogService,
              private changeDetector: ChangeDetectorRef,
              private documentApi: DocumentApi,
              private documentService: DocumentService,
              private latestFacade: LatestDocumentsFacade,
              private router: Router,
              private platformService: PlatformService
  ) {
    this.vm$ = this.lajiFormFacade.vm$;
    this.footerService.footerVisible = false;
    this.formSubscription = this.vm$.subscribe(state => {
     this.form = state.form;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formId'] || changes['documentId'] || changes['template']) {
      this.lajiFormFacade.loadForm(this.formId, this.documentId, this.template);
      this.subErrors = this.lajiFormFacade.error$.pipe(
        mergeMap(() => this.lajiFormFacade.vm$.pipe(take(1)))
      ).subscribe(vm => this.errorHandling(vm));
    }
  }

  ngOnDestroy() {
    this.formSubscription.unsubscribe();
    this.footerService.footerVisible = true;
    if (this.subErrors) {
      this.subErrors.unsubscribe();
    }
    if (this.platformService.isBrowser) {
      try {
        const element = document.querySelector('.laji-form.blocking-loader.leaving');
        element.parentNode.removeChild(element);
      } catch (e) {}
    }
  }

  canDeactivate(leaveKey = 'haseka.form.leaveConfirm', cancelKey = 'haseka.form.discardConfirm') {
    if (!this.lajiFormFacade.hasChanges()) {
      return true;
    }
    return this.translate.get(this.isFromCancel ? cancelKey : leaveKey).pipe(
      switchMap(txt => this.dialogService.confirm(txt)),
      tap(confirmed => {
        if (confirmed && this.isFromCancel) {
          this.lajiFormFacade.discardChanges();
        }
        this.isFromCancel = false;
      })
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  preventLeave($event) {
    if (this.lajiFormFacade.hasChanges()) {
      $event.returnValue = this.leaveMsg;
    }
  }

  onCancel() {
    this.isFromCancel = true;
    this.cancel.emit();
  }

  onChange(formData) {
    this.status = 'unsaved';
    this.saveVisibility = 'shown';
    this.lajiFormFacade.dataUpdate(formData);
    this.touchedCounter++;
  }

  somethingChanged(input, event) {
    this.templateForm[input] = event.target.value;
  }

  lock(lock) {
    this.lajiFormFacade.lock(lock);
  }

  onSubmit(event) {
    if (this.subSaving) {
      return;
    }
    const document = event.data.formData;
    if (!this.template) {
      this.lajiForm.block();
      this.subSaving = this.lajiFormFacade.save(document, this.publicityRestrictions).subscribe((res) => {
        this.lajiForm.unBlock();
        if (res.success) {
          this.toastsService.showSuccess(
            this.getMessage(
              this.publicityRestrictions === Document.PublicityRestrictionsEnum.publicityRestrictionsPrivate ? 'success-temp' : 'success',
              this.translate.instant('haseka.form.success')
            )
          );
          this.success.emit(res);
          this.latestFacade.update();
        } else {
          this.saveVisibility = 'shown';
          this.status = 'unsaved';
          this.toastsService.showError(this.getMessage('error', this.translate.instant('haseka.form.error')));
          this.subSaving = undefined;
        }
        this.changeDetector.markForCheck();
      });
    } else {
        this.tmpDocument = document;
        this.templateModal.show();
    }
  }

  onSaveTemplate(event) {
  }

  submitPublic() {
    this.publicityRestrictions = Document.PublicityRestrictionsEnum.publicityRestrictionsPublic;
    this.lajiForm.submit();
  }

  submitPrivate() {
    this.publicityRestrictions = Document.PublicityRestrictionsEnum.publicityRestrictionsPrivate;
    this.lajiForm.submit();
  }

  submitTemplate() {
    this.publicityRestrictions = Document.PublicityRestrictionsEnum.publicityRestrictionsPrivate;
    this.lajiForm.submit();
  }

  saveTemplate() {
    this.documentService.saveTemplate({...this.templateForm, document: this.tmpDocument})
    .subscribe(
      () => {
        this.toastsService.showSuccess(this.translate.instant('template.success'));
        setTimeout(() => {
          this.templateModal.hide();
          this.router.navigate(['/vihko/templates']);
        }, 200);
        this.templateForm = {
          name: '',
          description: '',
          type: 'gathering'
        };

        this.tmpDocument = {};
        this.changeDetector.markForCheck();
      },
      () => {
        this.toastsService.showError(this.translate.instant('template.error'));
        this.changeDetector.markForCheck();
      });
  }

  onValidationError(errors) {
    // Shallow clone so that change detection runs even if errors didn't change
    // so that footer updates buttons disabled correctly.
    this.validationErrors = errors && {...errors} || errors;
  }

  private errorHandling(vm: ILajiFormState) {
    switch (vm.error) {
      case FormError.missingNamedPlace:
        this.missingNamedplace.emit({
          collectionID: vm.form.collectionID,
          formID: vm.form.id
        });
        this.changeDetector.detectChanges();
        break;
      case FormError.noAccess:
        this.accessDenied.emit(vm.form.collectionID);
        this.changeDetector.detectChanges();
        break;
    }
  }

  private getMessage(type, defaultValue) {
    const {options = {}} = this.form || {};
    return (
      type === 'success' ? options.saveSuccessMessage :
      type === 'success-temp' ? options.saveDraftSuccessMessage :
      type === 'error' ? options.saveErrorMessage : undefined
    ) ?? defaultValue;
  }
}
