import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, of as ObservableOf, ReplaySubject, Subscription } from 'rxjs';
import { catchError, delay, distinctUntilChanged, map, mergeMap, switchMap, take, tap, } from 'rxjs/operators';
import { LocalStorage } from 'ngx-webstorage';
import * as merge from 'deepmerge';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { hotObjectObserver } from '../../shared/observable/hot-object-observer';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import { UserService } from '../../shared/service/user.service';
import { NamedPlace } from '../../shared/model/NamedPlace';
import { Util } from '../../shared/service/util.service';
import { DocumentService, Readonly } from '../own-submissions/service/document.service';
import { FormService } from '../../shared/service/form.service';
import { Document } from '../../shared/model/Document';
import { Annotation } from '../../shared/model/Annotation';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { Logger } from '../../shared/logger';
import { Form } from '../../shared/model/Form';
import { NamedPlacesService } from '../../shared/service/named-places.service';
import { FormPermissionService, Rights } from '../../shared/service/form-permission.service';
import { Person } from '../../shared/model/Person';
import { DocumentStorage } from '../../storage/document.storage';
import { LajiFormUtil } from './laji-form-util.service';
import { PersonApi } from '../../shared/api/PersonApi';
import { Global } from '../../../environments/global';

export enum FormError {
  ok,
  incomplete,
  notFoundForm,
  notFoundDocument,
  loadFailed,
  missingNamedPlace,
  noAccess,
  noAccessToDocument,
  templateDisallowed,
}

export interface ISuccessEvent {
  success: boolean;
  document: Document;
  form: Form.SchemaForm;
}

export interface FormWithData extends Form.SchemaForm {
  formData?: Document;
  annotations?: Form.IAnnotationMap;
  rights?: Rights;
  readonly?: Readonly;
}

export interface ILajiFormState {
  form?: FormWithData;
  hasChanges: boolean;
  namedPlace?: NamedPlace;
  namedPlaceForFormID?: string;
  error: FormError;
  saving: boolean;
  loading: boolean;
  isTemplate: boolean;
}

let _state: ILajiFormState = {
  hasChanges: false,
  saving: false,
  loading: false,
  isTemplate: false,
  error: FormError.incomplete,
};

@Injectable()
export class LajiFormDocumentFacade implements OnDestroy {

  @LocalStorage('tmpDocId', 1) private tmpDocId;

  private dataChange = new ReplaySubject<void>(1);
  private store  = new BehaviorSubject<ILajiFormState>(_state);
  dataChange$ = this.dataChange.asObservable();
  state$ = this.store.asObservable();

  form$          = this.state$.pipe(map((state) => state.form), distinctUntilChanged());
  hasChanges$    = this.state$.pipe(map((state) => state.hasChanges), distinctUntilChanged());
  loading$       = this.state$.pipe(map((state) => state.loading), distinctUntilChanged());
  isTemplate$    = this.state$.pipe(map((state) => state.isTemplate), distinctUntilChanged());
  saving$        = this.state$.pipe(map((state) => state.saving), distinctUntilChanged());
  error$         = this.state$.pipe(map((state) => state.error), distinctUntilChanged());
  namedPlace$    = this.state$.pipe(map((state) => state.namedPlace), distinctUntilChanged());

  vm$: Observable<ILajiFormState> = hotObjectObserver<ILajiFormState>({
    form: this.form$,
    hasChanges: this.hasChanges$,
    saving: this.saving$,
    error: this.error$,
    loading: this.loading$,
    isTemplate: this.isTemplate$,
    namedPlace: this.namedPlace$
  });

  private readonly dataSub: Subscription;
  private formSub: Subscription;

  constructor(
    private logger: Logger,
    private lajiApi: LajiApiService,
    private translateService: TranslateService,
    private userService: UserService,
    private documentService: DocumentService,
    private documentApi: DocumentApi,
    private formService: FormService,
    private namedPlacesService: NamedPlacesService,
    private formPermissionService: FormPermissionService,
    private documentStorage: DocumentStorage,
    private personApi: PersonApi
  ) {
    this.dataSub = this.dataChange$.pipe(
      mergeMap(() => this.userService.user$.pipe(take(1))),
      map(person => ({person, formData: _state.form && _state.form.formData})),
      mergeMap(data => data.formData && !_state.isTemplate ?
        this.documentStorage.setItem(data.formData.id, {...data.formData, dateEdited: this.currentDateTime()}, data.person) : of(null)
      )
    ).subscribe();
  }

  ngOnDestroy(): void {
    if (this.dataSub) {
      this.dataSub.unsubscribe();
    }
    if (this.formSub) {
      this.formSub.unsubscribe();
    }
  }

  loadForm(formID: string, documentID?: string, isTemplate = false): void {
    if (!formID) {
      this.updateState({..._state, error: FormError.incomplete});
      return;
    }
    if (this.formSub) {
      this.formSub.unsubscribe();
    }
    this.updateState({..._state, form: undefined, loading: true, hasChanges: false, error: FormError.incomplete, isTemplate});
    this.formSub = this.formService.getForm(formID, this.translateService.currentLang).pipe(
      map(data => isTemplate ? this.prepareTemplateForm(data) : data),
      switchMap(form => this.userService.user$.pipe(
        take(1),
        mergeMap(person => this.formPermissionService.getRights(form).pipe(
          tap(rights => rights.edit === false ? this.updateState({..._state, error: FormError.noAccess, form: {...form, rights}}) : null),
          mergeMap(rights => {
              return (documentID ? this.fetchExistingDocument(form, documentID) : this.fetchEmptyData(form, person)).pipe(
                map(data => ({...form, formData: data, rights, readonly: this.getReadOnly(data, rights, person)})),
                map((res: FormWithData) => res.readonly !== Readonly.false ?
                  {...res, uiSchema: {...res.uiSchema, 'ui:disabled': true}} :
                  res
                )
              );
            }
          )
        ))
      )),
      mergeMap(form => this.getAnnotations(documentID).pipe(
        map((annotations) => (annotations || []).reduce<Form.IAnnotationMap>((cumulative, current) => {
          if ((current.byRole || []).includes('MMAN.formAdmin')) {
            cumulative[current.targetID] = [current];
          }
          return cumulative;
        }, {})),
        map((annotations) => ({...form, annotations}))
      )),
      mergeMap(form => this.fetchUiSchemaContext(form, documentID).pipe(
        map(uiSchemaContext => ({...form, uiSchemaContext}))
      )),
      mergeMap(form => this.fetchNamedPlace(form).pipe(
        map(() => form)
      )),
      catchError((err) => {
        this.updateState({
          ..._state,
          error: err.status === 404 ? FormError.notFoundForm :  FormError.loadFailed
        });
        this.logger.error('Failed to load form', { error: err});
        return of(null);
      })
    ).subscribe((form: FormWithData) => {
      if (form?.formData?.locked) {
        form.uiSchema = {...(form.uiSchema || {}), 'ui:disabled': !this.isAdmin(form)};
      }
      this.updateState({..._state, loading: false, form, error: _state.error === FormError.incomplete ? FormError.ok : _state.error});
    });
  }

  useNamedPlace(namedPlace: NamedPlace, namedPlaceForFormID: string) {
    this.updateState({..._state, namedPlace, namedPlaceForFormID});
  }

  lock(lock: boolean) {
    this.updateState({..._state, hasChanges: true, form: {
      ..._state.form,
        formData: {..._state.form.formData, locked: lock},
        uiSchema: {..._state.form.uiSchema, 'ui:disabled': this.isAdmin(_state.form) ? false : lock}
    }});
  }

  dataUpdate(doc: Document) {
    // Change data directly so that it would not trigger change detection. (Laji-form keeps state)
    _state.form.formData = doc;
    this.updateState({..._state, hasChanges: true});
    this.dataChange.next();
  }

  hasChanges(): boolean {
    return _state.hasChanges;
  }

  save(rawDocument: Document, publicityRestriction: Document.PublicityRestrictionsEnum): Observable<ISuccessEvent> {
    this.updateState({..._state, saving: true});
    const document = {...rawDocument};
    const isTmpId = !document.id || FormService.isTmpId(document.id);
    document.publicityRestrictions = publicityRestriction;
    if (isTmpId) { delete document.id; }

    return (isTmpId ?
      this.documentApi.create(document, this.userService.getToken()) :
      this.documentApi.update(document.id, document, this.userService.getToken())
    ).pipe(
      tap(() => this.namedPlacesService.invalidateCache()),
      tap(() => this.userService.user$.pipe(
        take(1),
        mergeMap(p => this.documentStorage.removeItem(rawDocument.id, p))).subscribe()
      ),
      catchError(e => {
        this.logger.error('UNABLE TO SAVE DOCUMENT', { data: JSON.stringify(document), error: JSON.stringify(e._body)});
        return of(null);
      }),
      map(doc => ({success: !!doc, form: _state.form, document: doc})),
      tap((res) => this.updateState({
        ..._state,
        saving: false,
        hasChanges: res.success ? false : _state.hasChanges
      }))
    );
  }

  discardChanges() {
    if (_state.form && _state.form.formData) {
      const id = _state.form.formData.id;
      this.updateState({..._state, form: {..._state.form, formData: null}, error: FormError.incomplete});
      this.userService.user$.pipe(
        take(1),
        delay(100), // Adding data to documentStorage is asynchronous so this delay is to make sure that the last save has gone thought
        mergeMap(person => this.documentStorage.removeItem(id, person)),
      ).subscribe();
    }
  }

  private isAdmin(form: FormWithData): boolean {
    return form && form.rights && form.rights.admin;
  }

  private getNewTmpId(): string {
    if (this.tmpDocId >= (Number.MAX_SAFE_INTEGER - 1003)) {
      this.tmpDocId = 0;
    }
    this.tmpDocId = this.tmpDocId + 1;
    return FormService.tmpNs + ':' +  this.tmpDocId;
  }

  private fetchExistingDocument(form: Form.SchemaForm, documentID: string): Observable<Document> {
    this.updateState({..._state});
    if (!documentID || FormService.isTmpId(documentID)) {
      this.updateState({..._state, hasChanges: true});
      return this.userService.user$.pipe(
        take(1),
        mergeMap(p => this.documentStorage.getItem(documentID, p).pipe(
          map(doc => LajiFormUtil.removeLajiFormIds(doc, form.schema))
        ))
      );
    }
    return this.userService.user$.pipe(
      take(1),
      mergeMap(person => this.documentStorage.getItem(documentID, person).pipe(
        mergeMap(local => this.documentApi.findById(documentID, this.userService.getToken()).pipe(
          map((document: Document) => {
            if (document.isTemplate) {
              if (form.options?.prepopulatedDocument) {
                return merge(
                  form.options?.prepopulatedDocument,
                  this.documentService.removeMeta(document, ['isTemplate', 'templateName', 'templateDescription']),
                  { arrayMerge: Util.arrayCombineMerge }
                );
              }
              return this.documentService.removeMeta(document, ['isTemplate', 'templateName', 'templateDescription']);
            }
            if (Util.isLocalNewestDocument(local, document)) {
              this.updateState({..._state, hasChanges: true});
              return local;
            }
            return document;
          }),
          catchError(err => {
            this.updateState({..._state, error:
                 err.status === 404 ? FormError.notFoundDocument :
                (err.status === 403 ? FormError.noAccessToDocument : FormError.loadFailed)});
            return of(null);
          })
        ))
      ))
    );
  }

  private fetchEmptyData(form: Form.SchemaForm, person: Person): Observable<Document> {
    return of({id: this.getNewTmpId(), formID: form.id, creator: person.id, gatheringEvent: { leg: [person.id] }}).pipe(
      map(base => form.options?.prepopulatedDocument ? merge(form.options?.prepopulatedDocument, base, { arrayMerge: Util.arrayCombineMerge }) : base),
      map(data => this.addNamedPlaceData(form, data)),
      switchMap(data => this.addCollectionID(form, data))
    );
  }

  private fetchUiSchemaContext(form: FormWithData, documentID?: string): Observable<Form.IUISchemaContext> {
    return of({
      ...form.uiSchemaContext,
      annotations: form.annotations,
      formID: form.id,
      creator: form.formData && form.formData.creator || undefined,
      isAdmin: form.rights && form.rights.admin,
      isEdit: documentID && !FormService.isTmpId(documentID),
      placeholderGeometry: _state.namedPlace && _state.namedPlace.geometry || undefined
    });
  }

  private getAnnotations(documentID: string, page = 1, results = []): Observable<Annotation[]> {
    return (!documentID || FormService.isTmpId(documentID)) ?
      ObservableOf([]) :
      this.lajiApi.getList(
        LajiApi.Endpoints.annotations,
        {personToken: this.userService.getToken(), rootID: documentID, pageSize: 100, page: page}
      ).pipe(
        mergeMap(result => (result.currentPage < result.lastPage) ?
          this.getAnnotations(documentID, result.currentPage + 1, [...results, ...result.results]) :
          ObservableOf([...results, ...result.results])),
        catchError(() => ObservableOf([]))
      );
  }

  private addNamedPlaceData(form: Form.SchemaForm, data: Document) {
    if (!form.options?.useNamedPlaces) {
      return data;
    }
    if (_state.namedPlaceForFormID !== form.id) {
      this.updateState({..._state, error: FormError.missingNamedPlace, form: form});
      return data;
    }

    const np: NamedPlace = _state.namedPlace;
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
    this.updateState({..._state, namedPlaceForFormID: ''});

    return merge(this.documentService.removeMeta(populate, removeList), data, { arrayMerge: Util.arrayCombineMerge });
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

  getReadOnly(data: Document, rights: Rights, person?: Person): Readonly {
    return this.documentService.getReadOnly(data, rights, person);
  }

  private currentDateTime() {
    return moment().format();
  }

  private updateState(state: ILajiFormState) {
    this.store.next(_state = state);
  }

  private fetchNamedPlace(form: FormWithData): Observable<void> {
    if (form.formData && form.formData.namedPlaceID && (!_state.namedPlace || _state.namedPlace.id !== form.formData.namedPlaceID)) {
      return this.namedPlacesService.getNamedPlace(form.formData.namedPlaceID, this.userService.getToken()).pipe(
        catchError(() => of(null)),
        tap(namedPlace => this.updateState({..._state, namedPlace})),
        map(() => void 0)
      );
    } else if (!form.options?.useNamedPlaces && _state.namedPlace) {
      this.updateState({..._state, namedPlace: null});
    }
    return of(void 0);
  }

  private prepareTemplateForm(data: Form.SchemaForm) {
    if (!data.options?.allowTemplate) {
      this.updateState({..._state, error: FormError.templateDisallowed});
      return data;
    }
    try {
      const templateForm = Util.clone(data);
      templateForm.uiSchema.gatherings.items.units['ui:field'] = 'HiddenField';
      templateForm.uiSchema.gatherings['ui:options']['belowUiSchemaRoot']['ui:field'] = 'HiddenField';
      return templateForm;
    } catch (e) {
      console.error(e);
      return data;
    }
  }
}
