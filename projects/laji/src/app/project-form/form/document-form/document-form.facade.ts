import { Injectable } from '@angular/core';
import { catchError, map, mergeMap, switchMap, take, tap, distinctUntilChanged, mapTo, shareReplay, distinctUntilKeyChanged } from 'rxjs';
import { combineLatest, concat, merge, Observable, of, ReplaySubject, Subscription } from 'rxjs';
import { TemplateForm } from '../../../shared-modules/own-submissions/models/template-form';
import { FooterService } from '../../../shared/service/footer.service';
import { LatestDocumentsFacade } from '../../../shared-modules/latest-documents/latest-documents.facade';
import { DocumentService } from '../../../shared-modules/own-submissions/service/document.service';
import { FormService } from '../../../shared/service/form.service';
import * as Util from '../../../shared/utils';
import { UserService } from '../../../shared/service/user.service';
import { FormPermissionService, Rights } from '../../../shared/service/form-permission.service';
import { DocumentStorage } from '../../../storage/document.storage';
import deepmerge from 'deepmerge';
import moment from 'moment';
import { LocalStorage } from 'ngx-webstorage';
import { Global } from 'projects/laji/src/environments/global';
import { Logger } from '../../../shared/logger';
import { LajiFormUtil } from 'projects/laji/src/app/project-form/form/laji-form/laji-form-util.service';
import equals from 'deep-equal';
import { ProjectFormService } from '../../../shared/service/project-form.service';
import { LajiApiClientService } from 'projects/laji-api-client/src/laji-api-client.service';
import { components } from 'projects/laji-api-client/generated/api.d';
import { Unsaved } from '../../../shared/utils';
import { LocalizedError } from '../../../shared/error/localized-error';

type Form = components['schemas']['Form'];
type Annotation = components['schemas']['store-annotation'];
type Document = components['schemas']['store-document'];
type NamedPlace = components['schemas']['store-namedPlace'];
type Person = components['schemas']['SensitivePerson'];

export enum Readonly {
  noEdit,
  false,
  true
}

export interface InputModel {
  form: Form;
  formData: any;
  hasChanges: boolean;
  template: boolean;
  namedPlace?: NamedPlace;
}

export interface ViewModel extends InputModel {
  readonly: Readonly;
  isAdmin: boolean;
  namedPlaceHeader: string[];
  locked?: boolean;
  editingOldWarning?: string;
}

interface DocumentAndHasChanges {
  document: Unsaved<Document>;
  hasChanges: boolean;
}

@Injectable()
export class DocumentFormFacade {
  @LocalStorage('tmpDocId', 1) private tmpDocId!: number;

  vm$!: Observable<ViewModel>;
  vm!: ViewModel;
  private locked$!: Observable<boolean | undefined>;
  private formData$!: Observable<any>;
  private formDataChange$ = new ReplaySubject<any>();
  private hasChanges$!: Observable<boolean>;
  private onSaved$ = new ReplaySubject<void>();
  private vmSub!: Subscription;
  private saveTmpSub!: Subscription;
  private annotationCache: Record<string, Observable<Annotation[]>> = {};
  private memoizedForm: {form?: Form; uiSchema?: any; uiSchemaContext?: any; result?: any} = {};

  constructor(
    private footerService: FooterService,
    private latestFacade: LatestDocumentsFacade,
    private documentService: DocumentService,
    private userService: UserService,
    private formPermissionService: FormPermissionService,
    private documentStorage: DocumentStorage,
    private logger: Logger,
    private projectFormService: ProjectFormService,
    private api: LajiApiClientService
  ) {
    this.footerService.footerVisible = false;
  }

  getViewModel(_formID: string, _documentID: string | undefined, _namedPlaceID: string | undefined, _template: boolean) {
    const formID$ = of(_formID);
    const documentID$ = of(_documentID);
    const namedPlaceID$ = of(_namedPlaceID);
    const template$ = of(_template);
    const user$ = this.userService.user$.pipe(take(1));

    const form$: Observable<Form> = combineLatest([formID$, template$, documentID$]).pipe(
      switchMap(([formID, template]) => this.projectFormService.getForm$(formID).pipe(
        map(form => {
          if (template && !form?.options?.allowTemplate) {
            throw new LocalizedError('haseka.form.templateDisallowed');
          }
          return form;
        })
      ))
    );

    const existingDocumentAndHasChanges$: Observable<DocumentAndHasChanges | null> = form$.pipe(
      switchMap(form => documentID$.pipe(switchMap(documentID => documentID
        ? this.fetchExistingDocument((form as Form), documentID)
        : of(null)
      ))),
      shareReplay()
    );

    const namedPlace$: Observable<NamedPlace | null> = combineLatest([existingDocumentAndHasChanges$, namedPlaceID$]).pipe(
      map(([existingDocument, namedPlaceID]) => existingDocument?.document?.namedPlaceID || namedPlaceID
      ),
      switchMap((namedPlaceID) => namedPlaceID
        ? this.api.get('/named-places/{id}', { path: { id: namedPlaceID } })
        : of(null)
      ),
      take(1),
    ) as Observable<NamedPlace | null>;

    const inputModel$: Observable<InputModel> = combineLatest([form$, template$]).pipe(
      switchMap(([form, template]) =>
        combineLatest([existingDocumentAndHasChanges$, namedPlace$, user$]).pipe(
            switchMap(([existingDocument, namedPlace, user]) =>
              (existingDocument
                ? of(existingDocument)
                : this.fetchEmptyData(form, user, namedPlace as NamedPlace)
              ).pipe(map(documentModel =>
                ({form, namedPlace, formData: documentModel.document, hasChanges: documentModel.hasChanges, template})))
            )
          )
      ),
      shareReplay()
    ) as Observable<InputModel>;

    this.formData$ = concat(inputModel$.pipe(take(1), map(({formData}) => formData)), this.formDataChange$);
    this.hasChanges$ = concat(
      inputModel$.pipe(take(1), map(({hasChanges}) => hasChanges)),
      merge(
        this.formDataChange$.pipe(mapTo(true)),
        this.onSaved$.pipe(mapTo(false))
      )
    ).pipe(distinctUntilChanged());

    this.locked$ = inputModel$.pipe(switchMap(({form}) => this.formData$.pipe(
      map(formData => (form.id?.indexOf('T:') !== 0 && form.options?.adminLockable)
        ? (formData && !!formData.locked)
        : undefined
      ),
      distinctUntilChanged()
    )));

    const rights$ = form$.pipe(switchMap(form => this.formPermissionService.getRights(form)));
    const readonly$ = combineLatest([rights$, user$, this.formData$]).pipe(
      map(([rights, user, formData]) => this.documentService.getReadOnly(formData, rights, user))
    );

    const uiSchemaContext$ = combineLatest([
      form$.pipe(distinctUntilKeyChanged('id')),
      namedPlace$.pipe((distinctUntilKeyChanged as any)('id')),
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
      form$,
      template$
    ]).pipe(map(([locked, readonly, rights, form, template]) =>
      this.getUiSchema(form, locked as boolean, readonly, rights, template),
      shareReplay()
    ));

    // Derive state from the input model and create the view model.
    // View model is the combination of data derived from inputs and local state and other asynchronously fetched data,
    // containing everything that the view needs.
    this.vm$ = inputModel$.pipe(switchMap(inputModel => {
      const {form, formData} = inputModel;

      return combineLatest([inputModel$, this.locked$, readonly$, rights$, uiSchema$, uiSchemaContext$, this.hasChanges$, this.formData$, documentID$]).pipe(
        map(([_inputModel, locked, readonly, rights, uiSchema, uiSchemaContext, hasChanges, _formData, documentID]) => ({
            ..._inputModel,
            form: this.getMemoizedForm(_inputModel.form, uiSchema, uiSchemaContext),
            readonly,
            isAdmin: rights.admin,
            locked,
            hasChanges,
            formData: _formData,
            editingOldWarning: this.getEditingOldWarning(form, formData, documentID),
            namedPlaceHeader: this.getNamedPlaceHeader(form, _inputModel.namedPlace)
          }))
      );
    }));

    this.vmSub = this.vm$.subscribe(vm => {
        this.vm = vm;
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
  getMemoizedForm(form: Form, uiSchema: any, uiSchemaContext: any) {
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

  save(data: Unsaved<Document>): Observable<Document>;
  save(data: TemplateForm): Observable<TemplateForm>;
  save(data: Unsaved<Document> | TemplateForm): Observable<Document | TemplateForm> {
    return this.vm.template
      ? this.saveTemplate(data as TemplateForm)
      : this.saveDocument(data as Document);
  }

  clearUnlinkedTmpDocsSub(): void {
    this.documentStorage.clearUnlinkedTmpDocs$().pipe(take(1)).subscribe();
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
            this.api.flush('/named-places');
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

  private getEditingOldWarning(form: Form, formData: any, documentID?: string): string | undefined {
    if (documentID && form.options?.warnEditingOldDocument) {
      // ISO 8601 duration
      const warnEditingOldDocumentDuration = 'P1W';
      const docCreateDuration = moment.duration(moment().diff(moment(formData.dateCreated)));
      if (moment.duration(warnEditingOldDocumentDuration).subtract(docCreateDuration).asMilliseconds() < 0) {
        return moment(formData.dateCreated).format('DD.MM.YYYY');
      }
    }
    return undefined;
  }

  private getNamedPlaceHeader(form: Form, namedPlace: NamedPlace | undefined): string[] {
    if (!form || !namedPlace) {
      return [];
    }
    return form.options?.namedPlaceOptions?.headerFields || ['alternativeIDs', 'name', 'municipality'];
  }

  private fetchExistingDocument(form: Form, documentID: string): Observable<DocumentAndHasChanges> {
    if (FormService.isTmpId(documentID)) {
      return this.userService.user$.pipe(
        take(1),
        mergeMap(p => this.documentStorage.getItem(documentID, p).pipe(
          mergeMap(doc => doc ? of(doc) : this.documentStorage.getItem(documentID)),
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
          })
        ))
      ))
    );
  }

  private fetchEmptyData(form: Form, person: Person | undefined, namedPlace: NamedPlace): Observable<DocumentAndHasChanges> {
    let document: Unsaved<Document> = {
      id: this.getNewTmpId(),
      formID: form.id,
      creator: person?.id ? person.id : undefined,
      gatheringEvent: { leg: person?.id ? [person.id] : [] }
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

  private addNamedPlaceData(form: Form, data: Unsaved<Document>, np: NamedPlace): Unsaved<Document> {
    const populate = np.prepopulatedDocument ? Util.clone(np.prepopulatedDocument) : {};

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

  private addCollectionID(form: Form, data: Unsaved<Document>): Observable<Unsaved<Document>> {
    return form.id === Global.forms.privateCollection
      ? this.api.get('/person/profile').pipe(map(profile =>
        typeof profile?.personalCollectionIdentifier === 'string'
          ? <Document>{
            ...(data || {}),
            keywords: [...(data?.keywords || []), profile.personalCollectionIdentifier.trim()]
          }
          : data
      ))
      : of(data);
  }

  private getUiSchema(form: Form, locked: boolean, readonly: Readonly, rights: Rights, template: boolean) {
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
        (uiSchema as any).gatherings.items.units['ui:field'] = 'HiddenField';
        (uiSchema as any).gatherings['ui:options']['belowUiSchemaRoot']['ui:field'] = 'HiddenField';
      } catch (e) {
        console.error(e);
      }
    }
    return uiSchema;
  }

  private getUiSchemaContext(form: Form, namedPlace: NamedPlace, user: Person | undefined, rights: Rights, documentID: string): Observable<any> {
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
      map((annotations) => (annotations || []).reduce((cumulative, current) => {
        if (current.byRole?.includes('MMAN.formAdmin')) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          cumulative[current.targetID!] = [current];
        }
        return cumulative;
      }, {} as Record<string, Annotation[]>)),
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
    : this.api.get('/annotations', { query: { rootID: documentID, pageSize: 100, page } }).pipe(
      mergeMap(result => (result.currentPage < result.lastPage) ?
        this.getAnnotations(documentID, result.currentPage + 1, [...results, ...result.results]) :
        of([...results, ...result.results])),
      catchError(() => of([])),
      shareReplay(),
    );

    return this.annotationCache[cacheKey];
  }
}
