import { debounceTime, filter, throttleTime, distinctUntilChanged, tap, switchMap,  catchError, map, mergeMap } from 'rxjs/operators';
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
import { forkJoin as ObservableForkJoin, merge as ObservableMerge, Observable, of as ObservableOf, Subject, Subscription } from 'rxjs';
import { DocumentApi } from '../../../shared/api/DocumentApi';
import { UserService } from '../../../shared/service/user.service';
import { FooterService } from '../../../shared/service/footer.service';
import { LajiFormComponent } from '../laji-form/laji-form.component';
import { FormService, LoadResponse } from '../../../shared/service/form.service';
import { ToastsService } from '../../../shared/service/toasts.service';
import { Form } from '../../../shared/model/Form';
import { Logger } from '../../../shared/logger/logger.service';
import { Document } from '../../../shared/model/Document';
import { DialogService } from '../../../shared/service/dialog.service';
import { ComponentCanDeactivate } from '../../../shared/guards/document-de-activate.guard';
import { FormPermissionService } from '../../../+haseka/form-permission/form-permission.service';
import { NamedPlacesService } from '../../named-place/named-places.service';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import { Annotation } from '../../../shared/model/Annotation';

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
  @Output() success = new EventEmitter<{document: Document, form: any}>();
  @Output() error = new EventEmitter();
  @Output() cancel = new EventEmitter();
  @Output() accessDenied = new EventEmitter();
  @Output() missingNamedplace = new EventEmitter();
  @Output() tmpLoad = new EventEmitter();

  private changeSource = new Subject<any>();
  private changeEvent$ = this.changeSource.asObservable();

  public form: any;
  public lang: string;
  public status = '';
  public saveVisibility = 'hidden';
  public saving = false;
  public errorMsg: string;
  public namedPlace;
  public readyForForm = false;
  public readonly: boolean | string;
  public isAdmin = false;

  private subTrans: Subscription;
  private subFetch: Subscription;
  private subForm: Subscription;
  private subChanges: Subscription;
  private _success = '';
  private _error: any;
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
              private lajiApi: LajiApiService,
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
    this.subChanges = ObservableMerge(
        this.changeEvent$.pipe(throttleTime(3000)),
        this.changeEvent$.pipe(debounceTime(3000))
      ).pipe(
        distinctUntilChanged()
      ).subscribe((formData) => {
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
      .get(confirmKey).pipe(
        switchMap(txt => this.dialogService.confirm(txt)),
        tap((result) => {
          if (result) {
            this.formService.discard();
          }
        })
      );
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

  lock(lock) {
    this.form = {
      ...this.form,
      formData: {...this.form.formData, locked: lock},
      uiSchema: {...this.form.uiSchema, 'ui:disabled': lock}
    };
    this.updateReadonly().subscribe(() => {
      this.changeDetector.markForCheck();
    });
  }

  onSubmit(event) {
    let doc$;
    if (this.saving) {
      return;
    }
    this.saving = true;
    this.lajiForm.block();
    const data = event.data.formData;
    data['publicityRestrictions'] = this.publicityRestrictions;
    delete data._hasChanges;
    delete data._isTemplate;
    if (event.data.errorSchema) {
      // const errors = this.errorsToPath(event.data.errorSchema);
      // data.acknowledgedWarnings = Object.keys(errors).map(key => ({location: key, messages: errors[key]}));
    }
    if (this.isEdit) {
      doc$ = this.documentService.update(data.id || this.documentId, data, this.userService.getToken());
    } else {
      doc$ = this.documentService.create(data, this.userService.getToken());
    }
    doc$.subscribe(
      (result) => {
        this.lajiForm.unBlock();
        this.saving = false;
        this.formService.discard();
        this.form.formData._hasChanges = false;
        this.formService.setCurrentData(result, true);
        this.translate.get('haseka.form.success')
          .subscribe(value => {
            this.toastsService.showSuccess(this.getMessage('success', value));
            this.changeDetector.markForCheck();
          });
        this.namedPlaceService.invalidateCache();
        this.success.emit({document: result, form: this.form});
      },
      (err) => {
        this.lajiForm.unBlock();
        this.saving = false;
        this.saveVisibility = 'shown';
        this._error = this.parseErrorMessage(err);
        this.status = 'unsaved';
        this.logger.error('UNABLE TO SAVE DOCUMENT', {
          data: JSON.stringify(data),
          error: JSON.stringify(err._body)
        });
        this.translate.get('haseka.form.error')
          .subscribe(value => {
            this.toastsService.showError(this.getMessage('error', value));
            this.changeDetector.markForCheck();
          });
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
            .subscribe(id => this.tmpLoad.emit({
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

  updateReadonly(): Observable<boolean> {
    const {formData = {}} = this.form || {};
    return Observable.create(observer => {
      if (this.isAdmin) {
        this.readonly = false;
        return observer.next(this.readonly);
      }
      this.userService.getUser().subscribe(user => {
        if (formData.id && formData.creator !== user.id && (!formData.editors || formData.editors.indexOf(user.id) === -1)) {
          this.readonly = 'haseka.form.readonly';
        } else {
          this.readonly = formData.locked;
        }
        observer.next(this.readonly || false);
      });
    });
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
      .load(this.formId, this.translate.currentLang, this.documentId).pipe(
      switchMap<any, Observable<LoadResponse|boolean>>((data) => {
        if (data.formData._isTemplate && !this.formService.isTmpId(this.documentId)) {
          return this.formService.store(data.formData).pipe(
            tap(() => {
              this.tmpLoad.emit({
                formID: this.formId,
                tmpID: data.currentId
              });
            })).pipe(
            map(() => false));
        }
        return ObservableOf(data);
      })).pipe(
      filter((value: any) => value !== false),
      switchMap(
        data => (data.formData.namedPlaceID ? this.namedPlaceService
          .getNamedPlace(data.formData.namedPlaceID, this.userService.getToken()).pipe(
          catchError(() => ObservableOf({}))) : ObservableOf(undefined)).pipe(map(namedPace => ({data, namedPace}))),
      ),
      switchMap(result => ObservableForkJoin(
        this.formPermissionService.getRights(result.data),
          this.fetchAnnotations(this.documentId).pipe(
            map(annotations => {
              const lookup = {};
              if (Array.isArray(annotations) && annotations.length > 0) {
                annotations.forEach(annotation => {
                  if (!annotation) { return; }
                  const target = annotation.targetID || annotation.rootID;
                  if (!lookup[target]) {
                    lookup[target] = [];
                  }
                  lookup[target].push(annotation);
                });
              }
              return lookup;
            }))
        ).pipe(
          map(data => ({...result, rights: data[0], annotations: data[1]}))
        )
      ))
      .subscribe(
        result => {
          const data = result.data;
          this.namedPlace = result.namedPace;
          this.isEdit = true;
          if (data.features) {
            if (data.features.indexOf(Form.Feature.NamedPlace) > -1 && !this.namedPlace) {
              this.missingNamedplace.emit({
                collectionID: data.collectionID,
                formID: data.id
              });
              return;
            }
          }
          if (result.rights.edit === false) {
            this.accessDenied.emit(data.collectionID);
            return;
          }
          if (this.formService.isTmpId(this.documentId)) {
            delete data.formData._isTemplate;
            this.isEdit = false;
            data.formData.id = undefined;
          }
          if (typeof data.uiSchemaContext === 'undefined') {
            data.uiSchemaContext = {};
          }
          if (this.namedPlace && this.namedPlace.geometry) {
            data.uiSchemaContext.placeholderGeometry = this.namedPlace.geometry;
          }
          data.uiSchemaContext.formID = this.formId;
          this.isAdmin = result.rights.admin;
          data.uiSchemaContext.isAdmin = this.isAdmin;
          data.uiSchemaContext.annotations = result.annotations;
          this.form = data;
          this.updateReadonly().subscribe((readonly) => {
            this.lang = this.translate.currentLang;
            this.form.uiSchema['ui:disabled'] = readonly;
            this.readyForForm = true;
            if (this.hasChanges()) {
              this.saveVisibility = 'shown';
              this.status = 'unsaved';
            }
            this.changeDetector.markForCheck();
          });
        },
        err => {
          this.formService.isTmpId(this.documentId) ?
            this.error.emit(true) :
            this.translate
              .get(err.status === 404 ? 'haseka.form.documentNotFound' : 'haseka.form.genericError', {documentId: this.documentId})
              .subscribe(msg => {
                this.errorMsg = msg;
                this.changeDetector.markForCheck();
              });
        }
      );
  }

  private errorsToPath(err, obj = {}, path = '$') {
    Object.keys(err).forEach(key => {
      if (key === '__errors' || key === '__error') {
        err[key].forEach(message => {
          if (!obj[path]) {
            obj[path] = [];
          }
          obj[path].push(message);
        });
      } else {
        const currentPath = path + (isNaN(+key) ? '.' + key : '[' + key + ']');
        this.errorsToPath(err[key], obj, currentPath);
      }
    });
    return obj;
  }

  private getMessage(type, defaultValue) {
    if (this.form && this.form.options && this.form.options.messages && this.form.options.messages[type]) {
      return this.form.options.messages[type];
    }
    return defaultValue;
  }

  private fetchAnnotations(documentID, page = 1, results = []): Observable<Annotation[]> {
    return this.formService.isTmpId(documentID) ?
      ObservableOf([]) :
      this.lajiApi.getList(
        LajiApi.Endpoints.annotations,
        {personToken: this.userService.getToken(), rootID: this.documentId, pageSize: 100, page: page}
      ).pipe(
        mergeMap(result => (result.currentPage < result.lastPage) ?
          this.fetchAnnotations(this.documentId, result.currentPage + 1, [...results, ...result.results]) :
          ObservableOf([...results, ...result.results])),
        catchError(() => ObservableOf([]))
      );
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
