import { ChangeDetectionStrategy, Component, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { mergeMap, take, tap, delay, map, scan, filter } from 'rxjs/operators';
import { Observable, Subject, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { BrowserService } from '../../../shared/service/browser.service';
import { TemplateForm } from '../../../shared-modules/own-submissions/models/template-form';
import { FooterService } from '../../../shared/service/footer.service';
import { DialogService } from '../../../shared/service/dialog.service';
import { ToastsService } from '../../../shared/service/toasts.service';
import { Document } from '../../../shared/model/Document';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../shared/service/user.service';
import { DocumentStorage } from '../../../storage/document.storage';
import { LajiFormComponent } from 'projects/laji/src/app/+project-form/form/laji-form/laji-form/laji-form.component';
import { DocumentFormFacade, FormError, isFormError, SaneViewModel, isSaneViewModel, ViewModel } from './document-form.facade';
import { ProjectFormService } from '../../../shared/service/project-form.service';
import { ModalComponent } from 'projects/laji-ui/src/lib/modal/modal/modal.component';

@Component({
  selector: 'laji-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DocumentFormFacade
  ]
})
export class DocumentFormComponent implements OnInit, OnDestroy {
  @ViewChild(LajiFormComponent) lajiForm!: LajiFormComponent;
  @ViewChild('saveAsTemplate') public templateModal!: ModalComponent;

  @Input() formID!: string;
  @Input() documentID!: string;
  @Input() namedPlaceID!: string;
  @Input() template!: boolean;

  vm$!: Observable<ViewModel>;

  private touched$ = new Subject<void>();
  touchedCounter$ = this.touched$.pipe(map(() => 1), scan((acc, curr) => acc + curr));

  validationErrors: any;
  templateForm: TemplateForm = {
    name: '',
    description: ''
  };

  isFormError = isFormError;
  isSaneViewModel = isSaneViewModel;
  errors = FormError;

  private vm!: SaneViewModel;
  private isFromCancel = false;
  private confirmLeave = true;
  private saving = false;
  private publicityRestrictions!: Document.PublicityRestrictionsEnum;
  private documentForTemplate: any = {};
  private vmSub!: Subscription;

  constructor(
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private browserService: BrowserService,
    private route: ActivatedRoute,
    private projectFormService: ProjectFormService,
    private footerService: FooterService,
    private dialogService: DialogService,
    private toastsService: ToastsService,
    private translate: TranslateService,
    private userService: UserService,
    private documentStorage: DocumentStorage,
    private documentFormFacade: DocumentFormFacade
  ) { }

  ngOnInit() {
    this.vm$ = this.documentFormFacade.getViewModel(this.formID, this.documentID, this.namedPlaceID, this.template);
    this.vmSub = this.vm$.pipe(filter(isSaneViewModel)).subscribe(vm => {
      this.vm = vm;
    });
    this.footerService.footerVisible = false;
  }

  ngOnDestroy() {
    this.documentFormFacade.flush();
    this.vmSub.unsubscribe();
    this.footerService.footerVisible = true;
  }

  goBack() {
    if (this.vm.form.options?.simple) {
      this.router.navigate(this.localizeRouterService.translateRoute([this.vm.form.category ? '/save-observations' : '/vihko']));
      return;
    }

    const levels = [!!this.documentID, !!this.namedPlaceID].reduce((count, check) => count + (check ? 1 : 0), 1);

    this.browserService.goBack(() => {
      const urlRelativeFromFull = Array(levels)
        .fill(undefined)
        .reduce(_urlRelativeFromFull => _urlRelativeFromFull.replace(/\/[^/]+$/, '') , this.router.url);
      this.router.navigateByUrl(urlRelativeFromFull, {replaceUrl: true});
    });
  }

  successNavigation() {
    if (this.vm.form.options?.simple) {
      this.router.navigate(this.localizeRouterService.translateRoute([this.vm.form.category ? '/save-observations' : '/vihko']));
      return;
    }
    this.browserService.goBack(() => {
      this.projectFormService.getProjectRootRoute$(this.route).pipe(take(1)).subscribe(projectRoute => {
        const page = this.vm.form.options?.resultServiceType
          ? 'stats'
          : this.vm.form.options?.mobile
            ? 'about'
            : 'submissions';
        this.router.navigate([`./${page}`], {relativeTo: projectRoute});
      });
    });
  }

  canDeactivate(leaveKey = 'haseka.form.leaveConfirm', cancelKey = 'haseka.form.discardConfirm') {
    if (!this.confirmLeave || !this.vm?.hasChanges || this.template) {
      return true;
    }
    const msg = this.isFromCancel ? cancelKey : leaveKey;
    const confirmLabel = this.isFromCancel
      ? 'haseka.form.discardConfirm.confirm'
      : 'haseka.form.leaveConfirm.confirm';
    return this.dialogService.confirm(msg, confirmLabel).pipe(
      tap(confirmed => {
        if (confirmed && this.isFromCancel) {
            this.userService.user$.pipe(
              take(1),
              delay(100), // Adding data to documentStorage is asynchronous so this delay is to make sure that the last save has gone through.
              mergeMap(person => this.documentStorage.removeItem(this.vm.formData.id, person)),
            ).subscribe();
        }
        this.isFromCancel = false;
      })
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  preventLeave($event: any) {
    if (this.vm?.hasChanges) {
      $event.returnValue = undefined;
    }
  }

  onLeave() {
    this.isFromCancel = true;
    this.goBack();
  }

  onChange(formData: Document) {
    this.documentFormFacade.onChange(formData);
    this.touched$.next();
  }

  lock(lock: boolean) {
    this.documentFormFacade.lock(lock);
  }

  onSubmit(event: any) {
    if (this.saving) {
      return;
    }
    const document = event.data.formData;
    if (!this.template) {
      this.lajiForm.block();
      this.saving = true;
      this.documentFormFacade.save({...document, publicityRestrictions: this.publicityRestrictions}).subscribe(() => {
        this.lajiForm.unBlock();
        this.saving = false;
        this.toastsService.showSuccess(this.getMessage(
            this.publicityRestrictions === Document.PublicityRestrictionsEnum.publicityRestrictionsPrivate ? 'success-temp' : 'success',
           this.translate.instant('haseka.form.success')
        ));
        this.successNavigation();
      }, () => {
        this.lajiForm.unBlock();
        this.saving = false;
        this.lajiForm.displayErrorModal('saveError');
      });
    } else {
      this.documentForTemplate = document;
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
    this.documentFormFacade.save({...this.templateForm, document: this.documentForTemplate})
      .subscribe(
        () => {
          this.toastsService.showSuccess(this.translate.instant('template.success'));
          setTimeout(() => {
            this.templateModal.hide();
            this.router.navigate(this.localizeRouterService.translateRoute(['/vihko/templates']));
          }, 200);
          this.templateForm = {
            name: '',
            description: ''
          };

          this.documentForTemplate = {};
        },
        () => {
          this.toastsService.showError(this.translate.instant('template.error'));
        }
      );
  }

  onValidationError(errors: any) {
    // Shallow clone so that change detection runs even if errors didn't change
    // so that footer updates buttons disabled correctly.
    this.validationErrors = errors && {...errors} || errors;
  }

  onGoBack() {
    this.confirmLeave = false;
    this.goBack();
  }

  private getMessage(type: any, defaultValue: any) {
    const {options = {}} = this.vm.form || {};
    return (
      type === 'success' ? options.saveSuccessMessage :
      type === 'success-temp' ? options.saveDraftSuccessMessage :
      type === 'error' ? options.saveErrorMessage : undefined
    ) ?? defaultValue;
  }
}
