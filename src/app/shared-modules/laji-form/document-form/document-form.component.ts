import { switchMap, tap } from 'rxjs/operators';
import {
  AfterViewInit,
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
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { FooterService } from '../../../shared/service/footer.service';
import { LajiFormComponent } from '../laji-form/laji-form.component';
import { ToastsService } from '../../../shared/service/toasts.service';
import { Document } from '../../../shared/model/Document';
import { DialogService } from '../../../shared/service/dialog.service';
import { ComponentCanDeactivate } from '../../../shared/guards/document-de-activate.guard';
import { FormError, ILajiFormState, LajiFormDocumentFacade } from '@laji-form/laji-form-document.facade';

@Component({
  selector: 'laji-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormComponent implements AfterViewInit, OnChanges, OnDestroy, ComponentCanDeactivate {
  @ViewChild(LajiFormComponent, { static: false }) lajiForm: LajiFormComponent;
  @Input() formId: string;
  @Input() documentId: string;
  @Input() showHeader = true;
  @Input() showShortcutButton = true;
  @Output() success = new EventEmitter<{document: Document, form: any}>();
  @Output() error = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() accessDenied = new EventEmitter();
  @Output() missingNamedplace = new EventEmitter();
  @Output() tmpLoad = new EventEmitter();

  errors = FormError;
  public hasAlertContent = false;
  public form: any;
  public lang: string;
  public status = '';
  public saveVisibility = 'hidden';
  public namedPlace;
  public readonly: boolean | string;
  public isAdmin = false;

  private subSaving: Subscription;
  private leaveMsg;
  private publicityRestrictions;

  vm$: Observable<ILajiFormState>;

  constructor(private lajiFormFacade: LajiFormDocumentFacade,
              private footerService: FooterService,
              public translate: TranslateService,
              private toastsService: ToastsService,
              private dialogService: DialogService,
              private changeDetector: ChangeDetectorRef) {
    this.vm$ = this.lajiFormFacade.vm$.pipe(
      tap(vm => this.errorHandling(vm))
    );
    this.footerService.footerVisible = false;
  }

  ngAfterViewInit() {
    if (!this.documentId) {
      return;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formId'] || changes['documentId']) {
      this.lajiFormFacade.loadForm(this.formId, this.documentId);
    }
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;
  }

  canDeactivate(confirmKey = 'haseka.form.discardConfirm') {
    if (!this.lajiFormFacade.hasChanges()) {
      // TODO use new discrard
      // this.formService.discard();
      return true;
    }
    return this.translate
      .get(confirmKey).pipe(
        switchMap(txt => this.dialogService.confirm(txt)),
        tap((result) => {
          if (result) {
            // this.formService.discard();
          }
        })
      );
  }

  hasChanges() {
    return this.form && this.form.formData && this.form.formData._hasChanges;
  }

  @HostListener('window:beforeunload', ['$event'])
  preventLeave($event) {
    if (this.lajiFormFacade.hasChanges()) {
      $event.returnValue = this.leaveMsg;
    }
  }

  onChange(formData) {
    this.status = 'unsaved';
    this.saveVisibility = 'shown';
    this.lajiFormFacade.dataUpdate(formData);
  }

  lock(lock) {
    this.lajiFormFacade.lock(lock);
    /*
    this.updateReadonly().subscribe(() => {
      this.changeDetector.markForCheck();
    });
     */
  }

  onSubmit(event) {
    if (this.subSaving) {
      return;
    }
    const document = event.data.formData;
    this.lajiForm.block();
    this.subSaving = this.lajiFormFacade.save(document, this.publicityRestrictions)
      .subscribe((res) => {
        this.lajiForm.unBlock();
        if (res.success) {
          this.toastsService.showSuccess(
            this.getMessage(
              this.publicityRestrictions === Document.PublicityRestrictionsEnum.publicityRestrictionsPrivate ? 'success-temp' : 'success',
              this.translate.instant('haseka.form.success')
            )
          );
          this.success.emit({form: res.form, document: res.document});
        } else {
          this.saveVisibility = 'shown';
          this.status = 'unsaved';
          this.toastsService.showError(this.getMessage('error', this.translate.instant('haseka.form.error')));
        }
        this.changeDetector.markForCheck();
      });
  }

  submitPublic() {
    this.publicityRestrictions = Document.PublicityRestrictionsEnum.publicityRestrictionsPublic;
    this.lajiForm.submit();
  }

  submitPrivate() {
    this.publicityRestrictions = Document.PublicityRestrictionsEnum.publicityRestrictionsPrivate;
    this.lajiForm.submit();
  }

  /*
    .subscribe(
      data => {
        this.formService
          .store(data.formData)
          .subscribe(id => {
            this.tmpLoad.emit({
              formID: this.formId,
              tmpID: id
            });
          });
      }
    );
   */

  /* TODO refactor this to facade
  updateReadonly(): Observable<boolean> {
    const {formData = {}} = this.form || {};
    return Observable.create(observer => {
      if (this.isAdmin) {
        this.readonly = false;
        return observer.next(this.readonly);
      }
      this.userService.user$.pipe(take(1)).subscribe(user => {
        if (formData.id && formData.creator !== user.id && (!formData.editors || formData.editors.indexOf(user.id) === -1)) {
          this.readonly = 'haseka.form.readonly';
        } else {
          this.readonly = formData.locked;
        }
        observer.next(this.readonly || false);
      });
    });
  }
   */

  /*
  this.formService
    .subscribe(
      result => {
        this.updateReadonly().subscribe((readonly) => {
          this.lang = this.translate.currentLang;
          this.form.uiSchema['ui:disabled'] = readonly;
          this.readyForForm = true;
          this.changeDetector.markForCheck();
        });
      }
    );
   */

  private errorHandling(vm: ILajiFormState) {
    switch (vm.error) {
      case FormError.missingNamedPlace:
        this.missingNamedplace.emit({
          collectionID: vm.form.collectionID,
          formID: vm.form.id
        });
        break;
      case FormError.noAccess:
        this.accessDenied.emit(vm.form.collectionID);
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
