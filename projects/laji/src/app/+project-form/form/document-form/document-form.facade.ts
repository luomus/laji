import { Injectable } from '@angular/core';
import { catchError, map, mergeMap, switchMap, take, tap, filter, distinctUntilChanged, mapTo, shareReplay, distinctUntilKeyChanged } from 'rxjs/operators';
import { combineLatest, concat, merge, Observable, of, ReplaySubject, Subscription } from 'rxjs';
import { NamedPlace } from '../../../shared/model/NamedPlace';
import { TemplateForm } from '../../../shared-modules/own-submissions/models/template-form';
import { FooterService } from '../../../shared/service/footer.service';
import { Document } from '../../../shared/model/Document';
import { LatestDocumentsFacade } from '../../../shared-modules/latest-documents/latest-documents.facade';
import { DocumentService } from '../../../shared-modules/own-submissions/service/document.service';
import { Form } from '../../../shared/model/Form';
import { FormService } from '../../../shared/service/form.service';
import { Util } from '../../../shared/service/util.service';
import { UserService } from '../../../shared/service/user.service';
import { FormPermissionService, Rights } from '../../../shared/service/form-permission.service';
import { NamedPlacesService } from '../../../shared/service/named-places.service';
import { DocumentStorage } from '../../../storage/document.storage';
import * as deepmerge from 'deepmerge';
import * as moment from 'moment';
import { LocalStorage } from 'ngx-webstorage';
import { Global } from 'projects/laji/src/environments/global';
import { PersonApi } from '../../../shared/api/PersonApi';
import { Person } from '../../../shared/model/Person';
import { Annotation } from '../../../shared/model/Annotation';
import { LajiApi, LajiApiService } from '../../../shared/service/laji-api.service';
import { Logger } from '../../../shared/logger';
import { LajiFormUtil } from 'projects/laji/src/app/+project-form/form/laji-form/laji-form-util.service';
import equals from 'deep-equal';
import { ProjectFormService } from '../../../shared/service/project-form.service';

export enum FormError {
  notFoundForm = 'notFoundForm',
  notFoundDocument = 'notFoundDocument',
  loadFailed = 'loadFailed',
  noAccess = 'noAccess',
  noAccessToDocument = 'noAccessToDocument',
  templateDisallowed = 'templateDisallowed',
  missingNamedPlace = 'missingNamedPlace'
}

export function isFormError(any: any): any is FormError {
  return typeof any === 'string' && !!FormError[any as keyof typeof FormError];
}

export enum Readonly {
  noEdit,
  false,
  true
}

export interface SaneInputModel {
  form: Form.SchemaForm;
  formData: any;
  hasChanges: boolean;
  template: boolean;
  namedPlace?: NamedPlace;
}

export type InputModel = SaneInputModel | FormError;

export interface SaneViewModel extends SaneInputModel {
  readonly: Readonly;
  isAdmin: boolean;
  namedPlaceHeader: string[];
  locked?: boolean;
  editingOldWarning?: string;
}

export function isSaneViewModel(any: ViewModel): any is SaneViewModel {
  return typeof any !== 'string' && any && !!any?.form;
}

export type ViewModel = SaneViewModel | FormError;

interface DocumentAndHasChanges {
  document: Document;
  hasChanges: boolean;
}

@Injectable()
export class DocumentFormFacade {
  @LocalStorage('tmpDocId', 1) private tmpDocId!: number;

  vm$!: Observable<ViewModel>;
  vm!: SaneViewModel;
  private locked$!: Observable<boolean | undefined>;
  private formData$!: Observable<any>;
  private formDataChange$ = new ReplaySubject<any>();
  private hasChanges$!: Observable<boolean>;
  private onSaved$ = new ReplaySubject<void>();
  private vmSub!: Subscription;
  private saveTmpSub!: Subscription;
  private annotationCache: Record<string, Observable<Annotation[]>> = {};
  private memoizedForm: {form?: Form.SchemaForm; uiSchema?: any; uiSchemaContext?: any; result?: any} = {};

  constructor(
    private footerService: FooterService,
    private latestFacade: LatestDocumentsFacade,
    private documentService: DocumentService,
    private userService: UserService,
    private formPermissionService: FormPermissionService,
    private namedPlacesService: NamedPlacesService,
    private documentStorage: DocumentStorage,
    private personApi: PersonApi,
    private lajiApi: LajiApiService,
    private logger: Logger,
    private projectFormService: ProjectFormService
  ) {
    this.footerService.footerVisible = false;
  }

  getViewModel(_formID: string, _documentID: string, _namedPlaceID: string, _template: boolean) {
    const formID$ = of(_formID);
    const documentID$ = of(_documentID);
    const namedPlaceID$ = of(_namedPlaceID);
    const template$ = of(_template);
    const user$ = this.userService.user$.pipe(take(1));

    const isSane = filter(<T>(f: T | FormError): f is T => !isFormError(f));

    const form$: Observable<Form.SchemaForm | FormError> = combineLatest([formID$, template$]).pipe(
      switchMap(([formID, template]) => this.projectFormService.getForm$(formID).pipe(
        switchMap(form => template && !form.options?.allowTemplate
          ? of(FormError.templateDisallowed)
          : this.formPermissionService.getRights(form).pipe(map(rights =>
            (rights.edit === false && !form.options.openForm)
              ? FormError.noAccess
              : form
          ))
        ),
        catchError((error) => {
          this.logger.error('Failed to load form', {error});
          return of(error.status === 404 ? FormError.notFoundForm :  FormError.loadFailed);
        }),
      ))
    );

    const existingDocument$: Observable<DocumentAndHasChanges | FormError | null> = form$.pipe(
      isSane,
      switchMap(form => documentID$.pipe(switchMap(documentID => documentID
        ? this.fetchExistingDocument((form as Form.SchemaForm), documentID)
        : of(null)
      ))),
      shareReplay()
    );

    const includeUnits$ = form$.pipe(
      map(form => isFormError(form) ? form : form.options?.namedPlaceOptions?.includeUnits),
      distinctUntilChanged()
    );

    const namedPlace$: Observable<NamedPlace | FormError | null> = combineLatest([includeUnits$, existingDocument$, namedPlaceID$]).pipe(
      map(([includeUnits, existingDocument, namedPlaceID]): [boolean, string] =>
        isFormError(includeUnits) || isFormError(existingDocument)
          ? [false, '']
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          : [includeUnits!, existingDocument?.document?.namedPlaceID || namedPlaceID]
      ),
      switchMap(([includeUnits, namedPlaceID]) => namedPlaceID
        ? this.namedPlacesService.getNamedPlace(namedPlaceID, undefined, includeUnits)
        : of(null)
      ),
      take(1),
      catchError(() => of(FormError.missingNamedPlace))
    ) as Observable<NamedPlace | FormError | null>;

    const inputModel$: Observable<InputModel> = combineLatest([form$, template$]).pipe(
      switchMap(([form, template]) =>
        isFormError(form)
          ? of(form)
          : combineLatest([existingDocument$, namedPlace$, user$]).pipe(
            switchMap(([existingDocument, namedPlace, user]) =>
              isFormError(namedPlace)
              ? of(namedPlace)
              : (existingDocument
                ? of(existingDocument)
                : this.fetchEmptyData(form, user as Person, namedPlace as NamedPlace)
              ).pipe(map(documentModel => {
                if (isFormError(documentModel)) {
                  return documentModel;
                }
                return {form, namedPlace, formData: documentModel.document, hasChanges: documentModel.hasChanges, template};
              }))
            )
          )
      )
    ) as Observable<InputModel>;

    const saneInputModel$ = inputModel$.pipe(isSane, shareReplay());

    this.formData$ = concat(saneInputModel$.pipe(take(1), map(({formData}) => formData)), this.formDataChange$);
    this.hasChanges$ = concat(
      saneInputModel$.pipe(take(1), map(({hasChanges}) => hasChanges)),
      merge(
        this.formDataChange$.pipe(mapTo(true)),
        this.onSaved$.pipe(mapTo(false))
      )
    ).pipe(distinctUntilChanged());

    this.locked$ = saneInputModel$.pipe(switchMap(({form}) => this.formData$.pipe(
      map(formData => (form.id?.indexOf('T:') !== 0 && form.options?.adminLockable)
        ? (formData && !!formData.locked)
        : undefined
      ),
      distinctUntilChanged()
    )));

    const saneForm$ = form$.pipe(isSane);

    const rights$ = saneForm$.pipe(switchMap(form => this.formPermissionService.getRights(form)));
    const readonly$ = combineLatest([rights$, user$, this.formData$]).pipe(
      map(([rights, user, formData]) => this.documentService.getReadOnly(formData, rights, user))
    );

    const uiSchemaContext$ = combineLatest([
      saneForm$.pipe(distinctUntilKeyChanged('id')),
      namedPlace$.pipe(isSane, (distinctUntilKeyChanged as any)('id')),
      user$,
      rights$,
      this.formData$.pipe(map(data => data.id), distinctUntilChanged())
    ]).pipe(switchMap(([form, namedPlace, user, rights, id]) =>
      this.getUiSchemaContext(form, namedPlace as NamedPlace, user as Person, rights, id)
    ), distinctUntilChanged((a, b) => equals(a, b)), shareReplay());

    const uiSchema$ = combineLatest([
      this.locked$,
      readonly$,
      rights$,
      saneForm$,
      template$
    ]).pipe(map(([locked, readonly, rights, form, template]) =>
      this.getUiSchema(form, locked as boolean, readonly, rights, template),
      shareReplay()
    ));

    // Derive state from the input model and create the view model.
    // View model is the combination of data derived from inputs and local state and other asynchronously fetched data,
    // containing everything that the view needs.
    this.vm$ = inputModel$.pipe(switchMap(inputModel => {
      if (isFormError(inputModel)) {
        return of(inputModel);
      }
      const {form, formData} = inputModel;

      return combineLatest([inputModel$, this.locked$, readonly$, rights$, uiSchema$, uiSchemaContext$, this.hasChanges$, this.formData$, documentID$]).pipe(
        map(([_inputModel, locked, readonly, rights, uiSchema, uiSchemaContext, hasChanges, _formData, documentID]) => {
          if (isFormError(_inputModel)) {
            return _inputModel;
          }
          return {
            ..._inputModel,
            form: this.getMemoizedForm(_inputModel.form, uiSchema, uiSchemaContext),
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

    this.vmSub = this.vm$.pipe(isSane).subscribe(vm => {
        this.vm = (vm as SaneViewModel);
    });
    this.saveTmpSub = combineLatest([
      user$,
      this.formData$,
      template$,
      this.formDataChange$
    ]).subscribe(([person, formData, template, dataChanged]) => {
      if (dataChanged && !template) {
        this.documentStorage.setItem(formData.id, {...formData, dateEdited: moment().format()}, person);
      }
    });

    return this.vm$;
  }

  // Memoize the form so that it doesn't trigger change detection if nothing changed.
  getMemoizedForm(form: Form.SchemaForm, uiSchema: any, uiSchemaContext: any) {
    const result =  {...form, uiSchema, uiSchemaContext};
    const memoizedForm = {form, uiSchema, uiSchemaContext, result};
    if (Object.keys(memoizedForm).every(k => k === 'result' || (memoizedForm as any)[k] === (this.memoizedForm as any)[k])) {
      return this.memoizedForm.result;
    }
    this.memoizedForm = memoizedForm;
    return result;
  }

  flush() {
    this.vmSub.unsubscribe();
    this.saveTmpSub.unsubscribe();
  }

  onChange(formData: Document) {
    this.formDataChange$.next(formData);
  }

  lock(lock: boolean) {
    this.onChange({...this.vm.formData, locked: lock});
  }

  save(data: Document): Observable<Document>;
  save(data: TemplateForm): Observable<TemplateForm>;
  save(data: Document | TemplateForm): Observable<Document | TemplateForm> {
    return this.vm.template
      ? this.saveTemplate(data as TemplateForm)
      : this.saveDocument(data as Document);
  }

  private saveDocument(document: Document): Observable<Document> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const tmpId = FormService.isTmpId(document.id!) && document.id;
    if (tmpId) { delete document.id; }

    return (tmpId || !document.id
      ? this.documentService.create(document)
      : this.documentService.update(document.id, document)
    ).pipe(
      switchMap(doc =>
        this.userService.user$.pipe(
          take(1),
          switchMap(p => this.documentStorage.removeItem(tmpId as string, p)),
          tap(() => {
            this.onSaved$.next();
            this.latestFacade.update();
            this.namedPlacesService.invalidateCache();
          }),
          map(() => doc)
        )
      ),
      catchError(e => {
        this.logger.error('UNABLE TO SAVE DOCUMENT', { data: JSON.stringify(document), error: JSON.stringify(e._body)});
        throw e;
      })
    );
  }

  private saveTemplate(template: TemplateForm) {
    return this.documentService.saveTemplate(template);
  }

  private getEditingOldWarning(form: Form.SchemaForm, formData: any, documentID?: string): string | undefined {
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

  private getNamedPlaceHeader(form: Form.SchemaForm, namedPlace: NamedPlace): string[] {
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
        mergeMap(local => this.documentService.findById(documentID).pipe(
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
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (Util.isLocalNewestDocument(local!, document)) {
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

  private fetchEmptyData(form: Form.SchemaForm, person: Person | undefined, namedPlace: NamedPlace): Observable<DocumentAndHasChanges> {
    let document: Document = {
      id: this.getNewTmpId(),
      formID: form.id,
      creator: person?.id ? person.id : undefined,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      gatheringEvent: { leg: person?.id ? [person.id] : undefined }
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ...(form.excludeFromCopy!),
      '$.editors',
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
          ? <Document>{
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

  private getUiSchemaContext(form: Form.SchemaForm, namedPlace: NamedPlace, user: Person | undefined, rights: Rights, documentID: string): Observable<any> {
    const uiSchemaContext = {
      ...form.uiSchemaContext,
      formID: form.id,
      creator: user?.id ? user.id : undefined,
      isAdmin: rights && rights.admin,
      isEdit: documentID && !FormService.isTmpId(documentID),
      placeholderGeometry: namedPlace?.geometry || undefined
    };

    return this.getAnnotations(documentID).pipe(
      shareReplay(),
      map((annotations) => (annotations || []).reduce<Form.IAnnotationMap>((cumulative, current) => {
        if ((current.byRole || [] as any[]).includes('MMAN.formAdmin')) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          cumulative[current.targetID!] = [current];
        }
        return cumulative;
      }, {})),
      map((annotations) => ({...uiSchemaContext, annotations})),
    );
  }

  private getAnnotations(documentID: string, page = 1, results: any[] = []): Observable<Annotation[]> {
    const cacheKey = documentID + page;
    if (this.annotationCache[cacheKey]) {
      return this.annotationCache[cacheKey];
    }

    this.annotationCache[cacheKey] = (!documentID || FormService.isTmpId(documentID))
    ?  of([])
    : this.lajiApi.getList(
      LajiApi.Endpoints.annotations,
      {personToken: this.userService.getToken(), rootID: documentID, pageSize: 100, page}
    ).pipe(
      mergeMap(result => (result.currentPage < result.lastPage) ?
        this.getAnnotations(documentID, result.currentPage + 1, [...results, ...result.results]) :
        of([...results, ...result.results])),
      catchError(() => of([])),
      shareReplay(),
    );

    return this.annotationCache[cacheKey];
  }
}
