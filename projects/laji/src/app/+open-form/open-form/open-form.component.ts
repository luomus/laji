import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DocumentFormFacade, isSaneViewModel, SaneViewModel, ViewModel } from '../../+project-form/form/document-form/document-form.facade';
import { Observable, Subject, Subscription } from 'rxjs';
import { delay, filter, map, mergeMap, scan, take, tap } from 'rxjs/operators';
import { Document } from '../../shared/model/Document';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { LajiFormComponent } from '../../+project-form/form/laji-form/laji-form/laji-form.component';
import { DialogService } from '../../shared/service/dialog.service';
import { DocumentStorage } from '../../storage/document.storage';
import { UserService } from '../../shared/service/user.service';
import { NavbarService } from '../../shared/service/navbar.service';
import { ToastsService } from '../../shared/service/toasts.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalComponent } from 'projects/laji-ui/src/lib/modal/modal/modal.component';

@Component({
  selector: 'laji-open-form',
  styleUrls: ['./open-form.component.scss'],
  templateUrl: './open-form.component.html',
  providers: [
    DocumentFormFacade
  ]
})
export class OpenFormComponent implements OnInit, OnDestroy {
  @ViewChild(LajiFormComponent) lajiForm!: LajiFormComponent;
  @ViewChild('saveAsTemplate') public templateModal!: ModalComponent;

  vm$!: Observable<ViewModel>;

  documentID?: string;
  template = false;

  private touched$ = new Subject<void>();
  touchedCounter$ = this.touched$.pipe(map(() => 1), scan((acc, curr) => acc + curr));

  isSaneViewModel = isSaneViewModel;

  private vm!: SaneViewModel;
  private vmSub!: Subscription;
  private confirmLeave = true;
  private saving = false;
  private publicityRestrictions!: Document.PublicityRestrictionsEnum;
  private isFromCancel = false;
  private documentForTemplate: any = {};

  validationErrors: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private localizeRouterService: LocalizeRouterService,
    private navbarService: NavbarService,
    private dialogService: DialogService,
    private toastsService: ToastsService,
    private translate: TranslateService,
    private userService: UserService,
    private documentStorage: DocumentStorage,
    private documentFormFacade: DocumentFormFacade
  ) { }

  ngOnInit() {
    this.navbarService.navbarVisible = false;

    this.vm$ = this.documentFormFacade.getViewModel('MHL.1156', '', '', false);
    this.vmSub = this.vm$.pipe(filter(isSaneViewModel)).subscribe(vm => {
      this.vm = vm;
      this.cdr.detectChanges();
    });

    const urlParts = this.router.url.split('/');
    this.documentID = urlParts.length > 2 ? urlParts.pop() : undefined;
  }

  ngOnDestroy() {
    this.navbarService.navbarVisible = true;

    this.documentFormFacade.flush();
    this.vmSub.unsubscribe();
  }

  successNavigation() {
    this.router.navigate(['pyoriaiset/thank-you']);
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
                delay(100),
                mergeMap(person => this.documentStorage.removeItem(this.vm.formData.id, person)),
              ).subscribe();
          }
          this.isFromCancel = false;
        })
      );
    }

  onChange(formData: Document) {
    this.documentFormFacade.onChange(formData);
    this.touched$.next();
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

  onValidationError(errors: any) {
    this.validationErrors = errors && {...errors} || errors;
  }

  onGoBack() {
    this.confirmLeave = false;
    this.goBack();
  }

  lock(lock: boolean) {
    this.documentFormFacade.lock(lock);
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
    console.log('submitTemplate');
  }

  onLeave() {
    this.isFromCancel = true;
    this.goBack();
  }

  goBack() {
    this.router.navigate(this.localizeRouterService.translateRoute(['/vihko']));
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
