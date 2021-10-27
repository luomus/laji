import { ChangeDetectionStrategy, Component, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { catchError, map, mergeMap, switchMap, take, tap, delay, filter, distinctUntilChanged, scan, mapTo } from 'rxjs/operators';
import { combineLatest, concat, merge, Observable, of, ReplaySubject, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalizeRouterService } from '../../../locale/localize-router.service';
import { BrowserService } from '../../../shared/service/browser.service';
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
import { Form } from '../../../shared/model/Form';
import { FormService } from '../../../shared/service/form.service';
import { Util } from '../../../shared/service/util.service';
import { UserService } from '../../../shared/service/user.service';
import { FormPermissionService, Rights } from '../../../shared/service/form-permission.service';
import { NamedPlacesService } from '../../../shared/service/named-places.service';
import { DocumentStorage } from '../../../storage/document.storage';
import { DocumentApi } from '../../../shared/api/DocumentApi';
import { LajiFormUtil } from '../laji-form/laji-form-util.service';
import * as deepmerge from 'deepmerge';
import * as moment from 'moment';
import { LocalStorage } from 'ngx-webstorage';
import { Global } from 'projects/laji/src/environments/global';
import { PersonApi } from '../../../shared/api/PersonApi';
import { Person } from '../../../shared/model/Person';
import { Annotation } from '../../../shared/model/Annotation';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import { Logger } from '../../../shared/logger';

enum FormError {
  notFoundForm = 'notFoundForm',
  notFoundDocument = 'notFoundDocument',
  loadFailed = 'loadFailed',
  noAccess = 'noAccess',
  noAccessToDocument = 'noAccessToDocument',
  templateDisallowed = 'templateDisallowed',
  missingNamedPlace = 'missingNamedPlace'
}

function isFormError(any: any): any is FormError {
  return typeof any === 'string' && !!FormError[any];
}

enum Readonly {
  noEdit,
  false,
  true
}

interface SaneInputModel {
  form: Form.SchemaForm;
  formData: any;
  hasChanges: boolean;
  template: boolean;
  namedPlace?: NamedPlace;
}

type InputModel = SaneInputModel | FormError;

interface SaneViewModel extends SaneInputModel {
  readonly: Readonly;
  isAdmin: boolean;
  namedPlaceHeader: string[];
  locked?: boolean;
  editingOldWarning?: string;
}

function isSaneViewModel(any: ViewModel): any is SaneViewModel {
  return typeof any !== 'string' && any && !!any?.form;
}

type ViewModel = SaneViewModel | FormError;

interface DocumentAndHasChanges {
  document: Document;
  hasChanges: boolean;
}

@Component({
  selector: 'laji-project-form-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentFormComponent implements OnInit, OnDestroy {
  @ViewChild(LajiFormComponent) lajiForm: LajiFormComponent;
  @ViewChild('saveAsTemplate', { static: true }) public templateModal: ModalDirective;

  @Input() formID: string;
  @Input() documentID: string;
  @Input() namedPlaceID: string;
  @Input() template: boolean;

  @LocalStorage('tmpDocId', 1) private tmpDocId: number;

  vm$: Observable<ViewModel>;
  private locked$: Observable<boolean | undefined>;
  private formData$: Observable<any>;
  private formDataChange$ = new ReplaySubject<any>();
  private hasChanges$: Observable<boolean>;
  private onSaved$ = new ReplaySubject<void>();

  private vm: SaneViewModel;
  private isFromCancel = false;
  private confirmLeave = true;
  private saving = false;
  private publicityRestrictions: Document.PublicityRestrictionsEnum;

  validationErrors: any;
  templateForm: TemplateForm = {
    name: '',
    description: '',
    type: 'gathering'
  };
  documentForTemplate: any = {};
  touchedCounter$: Observable<number>;

  isFormError = isFormError;
  isSaneViewModel = isSaneViewModel;
  errors = FormError;

  private vmSub: Subscription;
  private saveTmpSub: Subscription;

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
    private latestFacade: LatestDocumentsFacade,
    private documentService: DocumentService,
    private formService: FormService,
    private userService: UserService,
    private formPermissionService: FormPermissionService,
    private namedPlacesService: NamedPlacesService,
    private documentStorage: DocumentStorage,
    private documentApi: DocumentApi,
    private personApi: PersonApi,
    private lajiApi: LajiApiService,
    private logger: Logger,
  ) {
    this.footerService.footerVisible = false;
  }

  ngOnInit() {
    const formID$ = of(this.formID);
    const documentID$ = of(this.documentID);
    const namedPlaceID$ = of(this.namedPlaceID);
    const template$ = of(this.template);
    const lang$ = of(this.translate.currentLang);

    const form$: Observable<Form.SchemaForm | FormError> = combineLatest([formID$, template$, lang$]).pipe(
      switchMap(([formID, template, lang]) => this.formService.getForm(formID, lang).pipe(
        map(form =>  template && !form.options?.allowTemplate ? FormError.templateDisallowed : form),
        catchError((error) => {
          this.logger.error('Failed to load form', {error});
          return of(error.status === 404 ? FormError.notFoundForm :  FormError.loadFailed);
        })
      ))
    );

    const inputModel$: Observable<InputModel> = combineLatest([form$, template$]).pipe(switchMap(([form, template]) => {
      if (isFormError(form)) {
        return of(form);
      }

      return this.formPermissionService.getRights(form).pipe(switchMap(rights => {
        if (rights.edit === false) {
          return of(FormError.noAccess);
        }

        const existingDocument$: Observable<DocumentAndHasChanges | FormError | null> = documentID$.pipe(switchMap(documentID => documentID
          ? this.fetchExistingDocument(form, documentID)
          : of(null)
        ));

        const namedPlace$: Observable<NamedPlace | FormError | null> = combineLatest([existingDocument$, namedPlaceID$]).pipe(
          map(([existingDocument, namedPlaceID]) =>
            (!isFormError(existingDocument) && existingDocument?.document?.namedPlaceID || namedPlaceID)
          ),
          switchMap(namedPlaceID => namedPlaceID
            ? this.namedPlacesService.getNamedPlace(namedPlaceID, undefined, form.options?.namedPlaceOptions?.includeUnits)
            : of(null)
          ),
          catchError(() => FormError.missingNamedPlace)
        );

        return combineLatest([existingDocument$, namedPlace$, this.userService.user$]).pipe(
          switchMap(([existingDocument, namedPlace, user]) =>
            isFormError(namedPlace)
              ? of(namedPlace)
            : (existingDocument
              ? of(existingDocument)
              : this.fetchEmptyData(form, user, namedPlace)
            ).pipe(map(documentModel => {
              if (isFormError(documentModel)) {
                return documentModel;
              }
              return {form, namedPlace, formData: documentModel.document, hasChanges: documentModel.hasChanges, template};
            }))
          )
        );
      }));
    }));

    const firstSaneInputModel$ = inputModel$.pipe(filter(im => !isFormError(im)), take(1)) as Observable<SaneInputModel>;

    this.formData$ = concat(firstSaneInputModel$.pipe(map(({formData}) => formData)), this.formDataChange$);
    this.hasChanges$ = concat(
      firstSaneInputModel$.pipe(map(({hasChanges}) => hasChanges)),
      merge(
        this.formDataChange$.pipe(mapTo(true)),
        this.onSaved$.pipe(mapTo(false))
      )
    ).pipe(distinctUntilChanged());

    this.touchedCounter$ = this.formData$.pipe(map(() => 1), scan((acc, curr) => acc + curr));

    this.locked$ = firstSaneInputModel$.pipe(switchMap(({form}) => this.formData$.pipe(
      map(formData => (form.id?.indexOf('T:') !== 0 && form.options?.adminLockable)
        ? (formData && !!formData.locked)
        : undefined
      ),
      distinctUntilChanged()
    )));

    // Derive state from the input model and create view model. Has the premise that the component @Inputs don't change.
    // View model is the combination of data derived from inputs and local state and other asynchronously fetched data.
    this.vm$ = inputModel$.pipe(take(1), switchMap(inputModel => {
      if (isFormError(inputModel)) {
        this.vm$ = of(inputModel);
        return;
      }
      const {form, formData} = inputModel;

      const rights$ = this.formPermissionService.getRights(form);
      const readonly$ = combineLatest([rights$, this.userService.user$]).pipe(
        map(([rights, user]) => this.documentService.getReadOnly(formData, rights, user))
      );

      const uiSchemaContext$ = combineLatest([this.userService.user$, rights$]).pipe(switchMap(([user, rights]) =>
        this.getUiSchemaContext(form, inputModel.namedPlace, user, rights, inputModel.formData.id)
      ));

      const uiSchema$ = combineLatest([this.locked$, readonly$, rights$]).pipe(map(([locked, readonly, rights]) =>
        this.getUiSchema(inputModel.form, locked, readonly, rights, inputModel.template)
      ));

      return combineLatest([inputModel$, this.locked$, readonly$, rights$, uiSchema$, uiSchemaContext$, this.hasChanges$, this.formData$, documentID$]).pipe(
        map(([_inputModel, locked, readonly, rights, uiSchema, uiSchemaContext, hasChanges, _formData, documentID]) => {
          if (isFormError(_inputModel)) {
            return _inputModel;
          }
          return {
            ..._inputModel,
            form: {
              ..._inputModel.form,
              uiSchema,
              uiSchemaContext
            },
            readonly,
            isAdmin: rights.admin,
            locked,
            hasChanges,
            formData: _formData,
            editingOldWarning: this.getEditingOldWarning(form, formData, documentID),
            namedPlaceHeader: this.getNamedPlaceHeader(form, _inputModel.namedPlace)
          };
        })
      );
    }));

    this.vmSub = this.vm$.pipe(filter(vm => !isFormError(vm))).subscribe(vm => {
        this.vm = (vm as SaneViewModel);
    });
    this.saveTmpSub = combineLatest([this.userService.user$.pipe(take(1)), this.formData$, template$]).subscribe(([person, formData, template]) => {
      if (!template) {
        this.documentStorage.setItem(formData.id, {...formData, dateEdited: this.currentDateTime()}, person);
      }
    });
  }

  ngOnDestroy() {
    this.footerService.footerVisible = true;
    this.vmSub.unsubscribe();
    this.saveTmpSub.unsubscribe();
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
      this.projectFormService.getProjectRootRoute(this.route).pipe(take(1)).subscribe(projectRoute => {
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
    if (!this.confirmLeave || !this.vm.hasChanges || this.template) {
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
              delay(100), // Adding data to documentStorage is asynchronous so this delay is to make sure that the last save has gone thought
              mergeMap(person => this.documentStorage.removeItem(this.vm.formData.id, person)),
            ).subscribe();
        }
        this.isFromCancel = false;
      })
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  preventLeave($event) {
    if (this.vm.hasChanges) {
      $event.returnValue = undefined;
    }
  }


  onLeave() {
    this.isFromCancel = true;
    this.goBack();
  }

  onChange(formData: any) {
    this.formDataChange$.next(formData);
  }

  lock(lock: boolean) {
    this.onChange({...this.vm.formData, locked: lock});
  }

  onSubmit(event) {
    if (this.saving) {
      return;
    }
    const document = event.data.formData;
    if (!this.template) {
      this.lajiForm.block();
      this.saving = true;
      this.save(document, this.publicityRestrictions).subscribe(doc => {
        this.lajiForm.unBlock();
        this.saving = false;
        if (doc) {
          this.toastsService.showSuccess(this.getMessage(
              this.publicityRestrictions === Document.PublicityRestrictionsEnum.publicityRestrictionsPrivate ? 'success-temp' : 'success',
             this.translate.instant('haseka.form.success')
          ));
          this.onSaved$.next();
          this.successNavigation();
          this.latestFacade.update();
        } else {
          this.lajiForm.displayErrorModal('saveError');
        }
      }, () => {
        this.saving = false;
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
    this.documentService.saveTemplate({...this.templateForm, document: this.documentForTemplate})
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

        this.documentForTemplate = {};
      },
      () => {
        this.toastsService.showError(this.translate.instant('template.error'));
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

  getFormDataForLajiForm(vm: SaneViewModel) {
    return {...vm.form, formData: vm.formData};
  }

  getEditingOldWarning(form: Form.SchemaForm, formData: any, documentID?: string): string | undefined {
    if (documentID && form.options?.warnEditingOldDocument) {
      // ISO 8601 duration
      const {warnEditingOldDocumentDuration = 'P1W'} = form.options || {};
      const docCreateDuration = moment.duration(moment().diff(moment(formData.dateCreated)));
      if (moment.duration(warnEditingOldDocumentDuration).subtract(docCreateDuration).asMilliseconds() < 0) {
        return moment(formData.dateCreated).format('DD.MM.YYYY');
      }
    }
    return undefined;
  }

  getNamedPlaceHeader(form: Form.SchemaForm, namedPlace: NamedPlace): string[] {
    if (!form || !namedPlace) {
      return [];
    }
    return form.options?.namedPlaceOptions?.headerFields || ['alternativeIDs', 'name', 'municipality'];
  }

  private fetchExistingDocument(form: Form.SchemaForm, documentID: string): Observable<DocumentAndHasChanges | FormError> {
    if (FormService.isTmpId(documentID)) {
      return this.userService.user$.pipe(
        take(1),
        mergeMap(p => this.documentStorage.getItem(documentID, p).pipe(
          map(doc => ({document: LajiFormUtil.removeLajiFormIds(doc, form.schema), hasChanges: true}))
        ))
      );
    }
    return this.userService.user$.pipe(
      take(1),
      mergeMap(person => this.documentStorage.getItem(documentID, person).pipe(
        mergeMap(local => this.documentApi.findById(documentID, this.userService.getToken()).pipe(
          map((document: Document) => {
            if (document.isTemplate) {
              const doc = this.documentService.removeMeta(document, ['isTemplate', 'templateName', 'templateDescription']);
              return {
                document: form.options?.prepopulatedDocument
                  ? deepmerge(form.options?.prepopulatedDocument, doc, { arrayMerge: Util.arrayCombineMerge })
                  : doc,
                hasChanges: false
              };
            }
            if (Util.isLocalNewestDocument(local, document)) {
              return {hasChanges: true, document: local};
            }
            return {document, hasChanges: false};
          }),
          catchError(err => of(
            err.status === 404 ? FormError.notFoundDocument :
            (err.status === 403 ? FormError.noAccessToDocument : FormError.loadFailed)
          ))
        ))
      ))
    );
  }

  private fetchEmptyData(form: Form.SchemaForm, person: Person, namedPlace: NamedPlace): Observable<DocumentAndHasChanges> {
    let document: Document = {
      id: this.getNewTmpId(),
      formID: form.id,
      creator: person.id,
      gatheringEvent: { leg: [person.id] }
    };
    if (form.options?.prepopulatedDocument) {
      document = deepmerge(form.options?.prepopulatedDocument, document, { arrayMerge: Util.arrayCombineMerge });
    }
    if (form.options.useNamedPlaces) {
      document = this.addNamedPlaceData(form, document, namedPlace);
    }
    return this.addCollectionID(form, document).pipe(map(doc => ({document: doc, hasChanges: false})));
  }

  private getNewTmpId(): string {
    if (this.tmpDocId >= (Number.MAX_SAFE_INTEGER - 1003)) {
      this.tmpDocId = 0;
    }
    this.tmpDocId = this.tmpDocId + 1;
    return FormService.tmpNs + ':' +  this.tmpDocId;
  }

  private addNamedPlaceData(form: Form.SchemaForm, data: Document, np: NamedPlace): Document {
    const populate: any = np.acceptedDocument ?
      Util.clone(np.acceptedDocument) :
      (np.prepopulatedDocument ? Util.clone(np.prepopulatedDocument) : {});

    populate.namedPlaceID = np.id;

    if (!populate.gatherings) {
      populate.gatherings = [{}];
    } else if (!populate.gatherings[0]) {
      populate.gatherings[0] = {};
    }

    if (np.notes) {
      if (!populate.gatheringEvent) {
        populate.gatheringEvent = {};
      }
      populate.gatheringEvent.namedPlaceNotes = np.notes;
    }

    let removeList = [
      ...(form.excludeFromCopy || DocumentService.removableGathering),
      '$.gatheringEvent.leg'
    ];
    if (form.options?.namedPlaceOptions?.includeUnits) {
      removeList = removeList.filter(item => item !== 'units');
    }

    return deepmerge(this.documentService.removeMeta(populate, removeList), data, { arrayMerge: Util.arrayCombineMerge });
  }

  private addCollectionID(form: Form.SchemaForm, data: Document): Observable<Document> {
    return form.id === Global.forms.privateCollection
      ? this.personApi.personFindProfileByToken(this.userService.getToken()).pipe(map(profile =>
        typeof profile?.personalCollectionIdentifier === 'string'
          ? {
            ...(data || {}),
            keywords: [...(data?.keywords || []), profile.personalCollectionIdentifier.trim()]
          }
          : data
      ))
      : of(data);
  }

  private getUiSchema(form: Form.SchemaForm, locked: boolean, readonly: Readonly, rights: Rights, template: boolean) {
    let {uiSchema = {}} = form;
    if (locked) {
        uiSchema = {...uiSchema, 'ui:disabled': !rights.admin};
    }
    if (readonly !== Readonly.false) {
        uiSchema = {...uiSchema, 'ui:disabled': true};
    }
    if (template) {
      try {
        uiSchema = Util.clone(uiSchema);
        uiSchema.gatherings.items.units['ui:field'] = 'HiddenField';
        uiSchema.gatherings['ui:options']['belowUiSchemaRoot']['ui:field'] = 'HiddenField';
      } catch (e) {
        console.error(e);
      }
    }
    return uiSchema;
  }

  private getUiSchemaContext(form: Form.SchemaForm, namedPlace: NamedPlace, user: Person, rights: Rights, documentID: string): Observable<any> {
    const uiSchemaContext = {
      formID: form.id,
      creator: user.id,
      isAdmin: rights && rights.admin,
      isEdit: documentID && !FormService.isTmpId(documentID),
      placeholderGeometry: namedPlace?.geometry || undefined
    };

    return this.getAnnotations(documentID).pipe(
      map((annotations) => (annotations || []).reduce<Form.IAnnotationMap>((cumulative, current) => {
        if ((current.byRole || []).includes('MMAN.formAdmin')) {
          cumulative[current.targetID] = [current];
        }
        return cumulative;
      }, {})),
      map((annotations) => ({...uiSchemaContext, annotations}))
    );
  }

  private getAnnotations(documentID: string, page = 1, results = []): Observable<Annotation[]> {
    return (!documentID || FormService.isTmpId(documentID)) ?
    of([]) :
    this.lajiApi.getList(
      LajiApi.Endpoints.annotations,
      {personToken: this.userService.getToken(), rootID: documentID, pageSize: 100, page: page}
    ).pipe(
      mergeMap(result => (result.currentPage < result.lastPage) ?
        this.getAnnotations(documentID, result.currentPage + 1, [...results, ...result.results]) :
        of([...results, ...result.results])),
      catchError(() => of([]))
    );
  }

  private save(rawDocument: Document, publicityRestriction: Document.PublicityRestrictionsEnum): Observable<Document> {
    const document = {...rawDocument};
    const isTmpId = !document.id || FormService.isTmpId(document.id);
    document.publicityRestrictions = publicityRestriction;
    if (isTmpId) { delete document.id; }

    return (isTmpId
      ? this.documentApi.create(document, this.userService.getToken())
      : this.documentApi.update(document.id, document, this.userService.getToken())
    ).pipe(
      tap(() => this.namedPlacesService.invalidateCache()),
      tap(() => this.userService.user$.pipe(
        take(1),
        mergeMap(p => this.documentStorage.removeItem(rawDocument.id, p))).subscribe()
      ),
      catchError(e => {
        this.logger.error('UNABLE TO SAVE DOCUMENT', { data: JSON.stringify(document), error: JSON.stringify(e._body)});
        return of(null);
      })
    );
  }

  private currentDateTime() {
    return moment().format();
  }

  private getMessage(type, defaultValue) {
    const {options = {}} = this.vm.form || {};
    return (
      type === 'success' ? options.saveSuccessMessage :
      type === 'success-temp' ? options.saveDraftSuccessMessage :
      type === 'error' ? options.saveErrorMessage : undefined
    ) ?? defaultValue;
  }
}
