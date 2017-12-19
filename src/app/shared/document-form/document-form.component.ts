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
  ViewChild
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { DocumentApi } from '../api/DocumentApi';
import { UserService } from '../service/user.service';
import { FooterService } from '../service/footer.service';
import { LajiFormComponent } from '../form/laji-form.component';
import { FormService } from '../service/form.service';
import { ToastsService } from '../service/toasts.service';
import { Form } from '../model/Form';
import { Logger } from '../logger/logger.service';
import { Document } from '../model/Document';
import { DialogService } from '../service/dialog.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { ComponentCanDeactivate } from './document-de-activate.guard';
import { FormPermissionService } from '../../+haseka/form-permission/form-permission.service';
import { NamedPlacesService } from '../../shared-modules/named-place/named-places.service';

/*
 * Change tamplateUrl to close or open the Vihko
 * open: './document-form.component.html'
 * closed: './document-form.component-closed.html'
 */

@Component({
  selector: 'laji-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormComponent implements AfterViewInit, OnChanges, OnDestroy, ComponentCanDeactivate {
  @ViewChild(LajiFormComponent) lajiForm: LajiFormComponent;
  @Input() formId: string;
  @Input() documentId: string;
  @Output() onSuccess = new EventEmitter<{document: Document, form: any}>();
  @Output() onError = new EventEmitter();
  @Output() onCancel = new EventEmitter();
  @Output() onAccessDenied = new EventEmitter();
  @Output() onMissingNamedplace = new EventEmitter();
  @Output() onTmpLoad = new EventEmitter();

  private changeSource = new Subject<any>();
  private changeEvent$ = this.changeSource.asObservable();

  public form: any;
  public lang: string;
  public tick = 0;
  public status = '';
  public saveVisibility = 'hidden';
  public saving = false;
  public errorMsg: string;
  public namedPlace;
  public readyForForm = false;

  private subTrans: Subscription;
  private subFetch: Subscription;
  private subForm: Subscription;
  private subChanges: Subscription;
  private success = '';
  private error: any;
  private isEdit = false;
  private leaveMsg;
  private publicityRestrictions;
  private current;

  constructor(private documentService: DocumentApi,
              private formService: FormService,
              private userService: UserService,
              private footerService: FooterService,
              public translate: TranslateService,
              private toastsService: ToastsService,
              private namedPlaceService: NamedPlacesService,
              private dialogService: DialogService,
              private formPermissionService: FormPermissionService,
              private logger: Logger,
              private changeDetector: ChangeDetectorRef) {
  }

  ngAfterViewInit() {
    if (!this.documentId) {
      return;
    }
    this.footerService.footerVisible = false;
    this.subTrans = this.translate.onLangChange.subscribe(
      () => this.onLangChange()
    );
    this.subChanges = Observable.merge(
        this.changeEvent$.throttleTime(3000),
        this.changeEvent$.debounceTime(3000)
      )
      .distinctUntilChanged()
      .subscribe((formData) => {
        this.saveVisibility = 'shown';
        this.status = 'unsaved';
        this.saving = false;
        formData._hasChanges = true;
        this.form['formData'] = formData;
        this.changeDetector.markForCheck();
        this.formService
          .store(formData)
          .subscribe();
      });
  }

  ngOnChanges() {
    if (!this.formId) {
      return;
    }
    if (this.documentId) {
      this.fetchFormAndDocument();
    } else {
      this.fetchForm();
    }
  }

  ngOnDestroy() {
    if (this.subChanges) {
      this.subChanges.unsubscribe();
    }
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    if (this.subTrans) {
      this.subTrans.unsubscribe();
    }
    this.footerService.footerVisible = true;
  }

  canDeactivate(confirmKey = 'haseka.form.discardConfirm') {
    if (!this.hasChanges()) {
      this.formService.discard();
      return true;
    }
    return this.translate
      .get(confirmKey)
      .switchMap(txt => this.dialogService.confirm(txt))
      .do((result) => {
        if (result) {
          this.formService.discard();
        }
      });
  }

  hasChanges() {
    return this.form && this.form.formData && this.form.formData._hasChanges;
  }

  @HostListener('window:beforeunload', ['$event'])
  preventLeave($event) {
    if (this.hasChanges()) {
      $event.returnValue = this.leaveMsg;
    }
  }

  onChange(formData) {
    this.changeSource.next(formData);
  }

  onLangChange() {
    this.translate.get('haseka.leave.unsaved')
      .subscribe((msg) => this.leaveMsg = msg);
    if (this.subForm) {
      this.subForm.unsubscribe();
    }
    this.subForm = this.formService
      .getForm(this.formId, this.translate.currentLang)
      .subscribe(form => {
        form['formData'] = this.form.formData;
        this.lang = this.translate.currentLang;
        this.form = form;
        this.changeDetector.markForCheck();
      });
  }

  onSubmit(event) {
    this.saving = true;
    this.lajiForm.block();
    const data = event.data.formData;
    data['publicityRestrictions'] = this.publicityRestrictions;
    delete data._hasChanges;
    delete data._isTemplate;
    let doc$;
    if (this.isEdit) {
      doc$ = this.documentService
        .update(data.id || this.documentId, data, this.userService.getToken());
    } else {
      doc$ = this.documentService.create(data, this.userService.getToken());
    }
    doc$.subscribe(
      (result) => {
        this.lajiForm.unBlock();
        this.formService.discard();
        this.form.formData._hasChanges = false;
        this.formService.setCurrentData(result, true);
        this.translate.get('haseka.form.success')
          .subscribe(value => {
            this.toastsService.showSuccess(value);
            this.changeDetector.markForCheck();
          });
        this.namedPlaceService.invalidateCache();
        this.onSuccess.emit({document: result, form: this.form});
      },
      (err) => {
        this.lajiForm.unBlock();
        this.saving = false;
        this.saveVisibility = 'shown';
        this.error = this.parseErrorMessage(err);
        this.status = 'unsaved';
        this.logger.error('UNABLE TO SAVE DOCUMENT', {
          data: JSON.stringify(data),
          error: JSON.stringify(err._body)
        });
        this.translate.get('haseka.form.error')
          .subscribe(value => {
            this.toastsService.showError(value);
            this.changeDetector.markForCheck();
          });
    });
  }

  submitPublic() {
    this.publicityRestrictions = 'MZ.publicityRestrictionsPublic';
    this.lajiForm.submit();
  }

  submitPrivate() {
    this.publicityRestrictions = 'MZ.publicityRestrictionsPrivate';
    this.lajiForm.submit();
  }

  fetchForm() {
    const key = this.formId + this.translate.currentLang;
    if (this.current === key) {
      return;
    }
    this.current = key;
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.subFetch = this.formService
      .load(this.formId, this.translate.currentLang)
      .subscribe(
        data => {
          this.formService
            .store(data.formData)
            .subscribe(id => this.onTmpLoad.emit({
              formID: this.formId,
              tmpID: id
            }));
        },
        err => {
          const msgKey = err.status === 404 ? 'haseka.form.formNotFound' : 'haseka.form.genericError';
          this.translate.get(msgKey, {formId: this.formId})
            .subscribe(data => this.errorMsg = data);
        }
      );
  }

  fetchFormAndDocument() {
    const key = this.formId + this.translate.currentLang + this.documentId;
    if (this.current === key) {
      this.changeDetector.markForCheck();
      return;
    }
    this.readyForForm = false;
    this.current = key;
    if (this.subFetch) {
      this.subFetch.unsubscribe();
    }
    this.formService
      .load(this.formId, this.translate.currentLang, this.documentId)
      .switchMap((data) => {
        if (data.formData._isTemplate && !this.formService.isTmpId(this.documentId)) {
          return this.formService.store(data.formData)
            .do(() => {
              this.onTmpLoad.emit({
                formID: this.formId,
                tmpID: data.currentId
              });
            })
            .map(() => false);
        }
        return Observable.of(data);
      })
      .filter((value) => value !== false)
      .switchMap(
        data => data.formData.namedPlaceID ? this.namedPlaceService
          .getNamedPlace(data.formData.namedPlaceID, this.userService.getToken())
          .catch(() => Observable.of({})) : Observable.of(undefined),
        (data, namedPace) => ({data, namedPace})
      )
      .switchMap(
        result => this.formPermissionService.hasEditAccess(result.data),
        (result, hasEditAccess) => ({...result, hasEditAccess})
      )
      .subscribe(
        result => {
          const data = result.data;
          this.namedPlace = result.namedPace;
          this.isEdit = true;
          if (result.hasEditAccess === false) {
            this.onAccessDenied.emit(data.collectionID);
            return;
          }
          if (data.features) {
            if (data.features.indexOf(Form.Feature.NamedPlace) > -1 && !this.namedPlace) {
              this.onMissingNamedplace.emit({
                collectionID: data.collectionID,
                formID: data.id
              });
              return;
            }
          }
          if (this.formService.isTmpId(this.documentId)) {
            delete data.formData._isTemplate;
            this.isEdit = false;
            data.formData.id = undefined;
          }
          if (typeof data.uiSchemaContext === 'undefined') {
            data.uiSchemaContext = {};
          }
          data.uiSchemaContext.activeGatheringIdx = this.isEdit ? null : 0;
          data.uiSchemaContext.formID = this.formId;
          this.form = data;
          this.lang = this.translate.currentLang;
          this.readyForForm = true;
          if (this.hasChanges()) {
            this.saveVisibility = 'shown';
            this.status = 'unsaved';
          }
          this.changeDetector.markForCheck();
        },
        err => {
          this.formService.isTmpId(this.documentId) ?
            this.onError.emit(true) :
            this.translate
              .get(err.status === 404 ? 'haseka.form.documentNotFound' : 'haseka.form.genericError', {documentId: this.documentId})
              .subscribe(msg => {
                this.errorMsg = msg;
                this.changeDetector.markForCheck();
              });
        }
      );
  }

  show(place: 'save'|'temp'|'cancel') {
    if (!this.form || !this.form.actions) {
      return true;
    }
    return place in this.form.actions;
  }

  buttonLabel(place: 'save'|'temp'|'cancel') {
    if (this.form && this.form.actions && this.form.actions[place]) {
      return this.form.actions[place];
    }
    if (place === 'save') {
      return 'haseka.form.savePublic';
    } else if (place === 'temp') {
      return 'haseka.form.savePrivate';
    }
    return 'haseka.form.back';
  }

  private parseErrorMessage(err) {
    let detail = '', data;
    if (err._body) {
      try {
        data = JSON.parse(err._body);
      } catch (e) {}
      detail = data && data.error && data.error.details ?
        data.error.details : '';
    }
    return detail;
  }
}
