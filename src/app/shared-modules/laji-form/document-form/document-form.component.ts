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
import { FormError, ILajiFormState, ISuccessEvent, LajiFormDocumentFacade } from '@laji-form/laji-form-document.facade';
import { DocumentApi } from '../../../shared/api/DocumentApi';
import { TemplateForm } from '../../own-submissions/models/template-form';
import { DocumentService } from '../../own-submissions/service/document.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { LatestDocumentsFacade } from '../../../shared-modules/latest-documents/latest-documents.facade';
import { Global } from '../../../../environments/global';

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
  form: any;
  lang: string;
  status = '';
  saveVisibility = 'hidden';
  isAdmin = false;
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
              private router: Router) {
    this.vm$ = this.lajiFormFacade.vm$;
    this.footerService.footerVisible = false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formId'] || changes['documentId']) {
      this.lajiFormFacade.loadForm(this.formId, this.documentId);
      this.subErrors = this.lajiFormFacade.error$.pipe(
        mergeMap(() => this.lajiFormFacade.vm$.pipe(take(1)))
      ).subscribe(vm => this.errorHandling(vm));
    }
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;
    if (this.subErrors) {
      this.subErrors.unsubscribe();
    }
  }

  canDeactivate(confirmKey = 'haseka.form.discardConfirm') {
    if (!this.lajiFormFacade.hasChanges()) {
      this.lajiFormFacade.discardChanges();
      return true;
    }
    return this.translate
      .get(confirmKey).pipe(
        switchMap(txt => this.dialogService.confirm(txt))
      );
  }

  @HostListener('window:beforeunload', ['$event'])
  preventLeave($event) {
    if (this.lajiFormFacade.hasChanges()) {
      $event.returnValue = this.leaveMsg;
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  onChange(formData) {
    this.status = 'unsaved';
    this.saveVisibility = 'shown';
    this.lajiFormFacade.dataUpdate(formData);
    this.touchedCounter++;
  }

  somethingChanged(input, event) {
    this.templateForm[input] = event.target.value
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
    if (Object.values(Global.canHaveHasekaLatest).some(this.router.url.includes.bind(this.router.url))) {
       this.latestFacade.update();
    }
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
        this.translate.get('template.success')
          .subscribe((value) => {
          this.toastsService.showSuccess(value);
          setTimeout(() => {
            this.templateModal.hide();
            this.router.navigate(['/vihko/templates']);
          }, 200);
          });
        this.templateForm = {
          name: '',
          description: '',
          type: 'gathering'
        };

        this.tmpDocument = {};
        //this.success.emit(res);
        this.changeDetector.markForCheck();
      },
      (err) => {
        this.translate.get('template.error')
          .subscribe((value) => this.toastsService.showError(value));
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
    if (this.form && this.form.options && this.form.options.messages && this.form.options.messages[type]) {
      return this.form.options.messages[type];
    }
    return defaultValue;
  }
}
