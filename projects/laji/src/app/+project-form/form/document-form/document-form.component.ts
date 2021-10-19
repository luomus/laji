import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { mergeMap, take, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { BrowserService } from '../../../shared/service/browser.service';
import { Form } from '../../../shared/model/Form';
import { FormError, FormWithData, ILajiFormState, LajiFormDocumentFacade } from '../laji-form/laji-form-document.facade';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { ProjectFormService } from '../../project-form.service';
import { TemplateForm } from '../../../shared-modules/own-submissions/models/template-form';
import { FooterService } from '../../../shared/service/footer.service';
import { DialogService } from '../../../shared/service/dialog.service';
import { LajiFormComponent } from '../laji-form/laji-form/laji-form.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastsService } from '../../../shared/service/toasts.service';
import { Document } from '../../../shared/model/Document';
import { TranslateService } from '@ngx-translate/core';
import { LatestDocumentsFacade } from '../../../shared-modules/latest-documents/latest-documents.facade';
import { DocumentService } from '../../../shared-modules/own-submissions/service/document.service';

@Component({
  selector: 'laji-project-form-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormComponent implements OnChanges, OnDestroy {
  @ViewChild(LajiFormComponent) lajiForm: LajiFormComponent;
  @ViewChild('saveAsTemplate', { static: true }) public templateModal: ModalDirective;

  @Input() form: Form.SchemaForm;
  @Input() documentID: string;
  @Input() template: boolean;

  npLoaded$ = new BehaviorSubject<boolean>(false);
  np: NamedPlace;

  errors = FormError;
  hasAlertContent = false;
  _form: FormWithData;
  lang: string;
  status = '';
  saveVisibility = 'hidden';
  isAdmin = false;
  isFromCancel = false;
  confirmLeave = true;
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

  @Input() set namedPlace(namedPlace: NamedPlace) {
    this.lajiFormDocumentFacade.useNamedPlace(namedPlace, this.form.id);
    this.npLoaded$.next(true);
    this.np = namedPlace;
  }

  constructor(
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private browserService: BrowserService,
    private route: ActivatedRoute,
    private lajiFormDocumentFacade: LajiFormDocumentFacade,
    private projectFormService: ProjectFormService,
    private lajiFormFacade: LajiFormDocumentFacade,
    private footerService: FooterService,
    private changeDetector: ChangeDetectorRef,
    private dialogService: DialogService,
    private toastsService: ToastsService,
    private translate: TranslateService,
    private latestFacade: LatestDocumentsFacade,
    private documentService: DocumentService,
  ) {
    this.vm$ = this.lajiFormFacade.vm$;
    this.footerService.footerVisible = false;
    this.formSubscription = this.vm$.subscribe(state => {
     this.form = state.form;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['form']?.previousValue?.id !== changes['form'].currentValue.id
      || changes['documentID']
      || changes['template']
    ) {
      this.lajiFormFacade.loadForm(this.form.id, this.documentID, this.template);
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
  }

  private errorHandling(vm: ILajiFormState) {
    switch (vm.error) {
      case FormError.missingNamedPlace:
        this.goBack();
        break;
      case FormError.noAccess:
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

  goBack() {
    if (this.form.options?.simple) {
      this.router.navigate(this.localizeRouterService.translateRoute([this.form.category ? '/save-observations' : '/vihko']));
      return;
    }

    const levels = [!!this.documentID, !!this.np].reduce((count, check) => count + (check ? 1 : 0), 1);

    this.browserService.goBack(() => {
      const urlRelativeFromFull = Array(levels)
        .fill(undefined)
        .reduce(_urlRelativeFromFull => _urlRelativeFromFull.replace(/\/[^/]+$/, '') , this.router.url);
      this.router.navigateByUrl(urlRelativeFromFull, {replaceUrl: true});
    });
  }

  onSuccess() {
    if (this.form.options?.simple) {
      this.router.navigate(this.localizeRouterService.translateRoute([this.form.category ? '/save-observations' : '/vihko']));
      return;
    }
    this.browserService.goBack(() => {
      this.projectFormService.getProjectRootRoute(this.route).pipe(take(1)).subscribe(projectRoute => {
        const page = this.form.options?.resultServiceType
          ? 'stats'
          : this.form.options?.mobile
            ? 'about'
            : 'submissions';
        this.router.navigate([`./${page}`], {relativeTo: projectRoute});
      });
    });
  }

  canDeactivate(leaveKey = 'haseka.form.leaveConfirm', cancelKey = 'haseka.form.discardConfirm') {
    if (!this.confirmLeave || !this.lajiFormFacade.hasChanges() || this.template) {
      return true;
    }
    const msg = this.isFromCancel ? cancelKey : leaveKey;
    const confirmLabel = this.isFromCancel
      ? 'haseka.form.discardConfirm.confirm'
      : 'haseka.form.leaveConfirm.confirm';
    return this.dialogService.confirm(msg, confirmLabel).pipe(
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

  onLeave() {
    this.isFromCancel = true;
    this.goBack();
  }

  onChange(formData) {
    this.status = 'unsaved';
    this.saveVisibility = 'shown';
    this.lajiFormFacade.dataUpdate(formData);
    this.touchedCounter++;
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
          this.onSuccess();
          this.latestFacade.update();
        } else {
          this.saveVisibility = 'shown';
          this.status = 'unsaved';
          this.lajiForm.displayErrorModal('saveError');
          this.subSaving = undefined;
        }
        this.changeDetector.markForCheck();
      });
    } else {
        this.tmpDocument = document;
        this.templateModal.show();
    }
  }

  submitPublic() {
    this.publicityRestrictions = Document.PublicityRestrictionsEnum.publicityRestrictionsPublic;
    this.lajiForm.submit();
  }

  submitPrivate() {
    this.publicityRestrictions = Document.PublicityRestrictionsEnum.publicityRestrictionsPrivate;
    this.lajiForm.submitOnlySchemaValidations();
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
          this.router.navigate(this.localizeRouterService.translateRoute(['/vihko/templates']));
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

  onGoBack() {
    this.confirmLeave = false;
    this.goBack();
  }
}
