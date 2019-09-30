import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, of as ObservableOf, ReplaySubject, Subscription } from 'rxjs';
import {
  auditTime,
  catchError, delay,
  distinctUntilChanged,
  map,
  mergeMap, switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { LocalStorage } from 'ngx-webstorage';
import merge from 'deepmerge';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { BrowserService } from '../../shared/service/browser.service';
import { hotObjectObserver } from '../../shared/observable/hot-object-observer';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import { UserService } from '../../shared/service/user.service';
import { NamedPlace } from '../../shared/model/NamedPlace';
import { Util } from '../../shared/service/util.service';
import { DocumentService } from '../own-submissions/service/document.service';
import { FormService } from '../../shared/service/form.service';
import { Document } from '../../shared/model/Document';
import { Annotation } from '../../shared/model/Annotation';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { Logger } from '../../shared/logger';
import { Form } from '../../shared/model/Form';
import { NamedPlacesService } from '../named-place/named-places.service';
import { FormPermissionService, Rights } from '../../+haseka/form-permission/form-permission.service';
import { Person } from '../../shared/model/Person';
import { DocumentStorage } from '../../storage/document.storage';

export enum FormError {
  ok,
  incomplete,
  notFoundForm,
  notFoundDocument,
  loadFailed,
  missingNamedPlace,
  noAccess
}

export enum Readonly {
  noEdit,
  false,
  true
}

export interface ISuccessEvent {
  success: boolean;
  document: Document;
  form: Form.SchemaForm;
  namedPlace?: NamedPlace;
}

interface FormWithData extends Form.SchemaForm {
  formData?: Document;
  annotations?: Form.IAnnotationMap;
  rights?: Rights;
  readonly?: Readonly;
}

export interface ILajiFormState {
  documentID?: string;
  form?: FormWithData;
  hasChanges: boolean;
  namedPlace?: NamedPlace;
  namedPlaceForFormID?: string;
  error: FormError;
  saving: boolean;
  loading: boolean;
}

let _state: ILajiFormState = {
  hasChanges: false,
  saving: false,
  loading: false,
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
  saving$        = this.state$.pipe(map((state) => state.saving), distinctUntilChanged());
  error$         = this.state$.pipe(map((state) => state.error), distinctUntilChanged());

  vm$: Observable<ILajiFormState> = hotObjectObserver<ILajiFormState>({
    form: this.form$,
    hasChanges: this.hasChanges$,
    saving: this.saving$,
    error: this.error$,
    loading: this.loading$
  });

  private readonly dataSub: Subscription;
  private formSub: Subscription;

  constructor(
    private logger: Logger,
    private browserService: BrowserService,
    private lajiApi: LajiApiService,
    private translateService: TranslateService,
    private userService: UserService,
    private documentService: DocumentService,
    private documentApi: DocumentApi,
    private formService: FormService,
    private namedPlacesService: NamedPlacesService,
    private formPermissionService: FormPermissionService,
    private documentStorage: DocumentStorage
  ) {
    this.dataSub = this.dataChange$.pipe(
      auditTime(3000),
      mergeMap(() => this.userService.user$.pipe(take(1))),
      map(person => ({person, formData: _state.form && _state.form.formData})),
      mergeMap(data => data.formData ?
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

  loadForm(formID: string, documentID?: string): void {
    if (!formID) {
      this.updateState({..._state, error: FormError.incomplete});
      return;
    }
    if (this.formSub) {
      this.formSub.unsubscribe();
    }
    this.updateState({..._state, form: undefined, loading: true, hasChanges: false, error: FormError.incomplete});
    this.formSub = this.formService.getForm(formID, this.translateService.currentLang).pipe(
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
          if (!cumulative[current.targetID]) {
            cumulative[current.targetID] = [];
          }
          cumulative[current.targetID].push(current);
          return cumulative;
        }, {})),
        map((annotations) => ({...form, annotations}))
      )),
      mergeMap(form => this.fetchUiSchemaContext(form, documentID).pipe(
        map(uiSchemaContext => ({...form, uiSchemaContext}))
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
      if (form && form.formData && form.formData.locked) {
        if (!form.uiSchema) {
          form.uiSchema = {};
        }
        form.uiSchema = {...form.uiSchema, 'ui:disabled': !this.isAdmin(form)};
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
    this.dataChange.next();
  }

  dataUpdate(doc: Document) {
    this.updateState({..._state, hasChanges: true, form: {..._state.form, formData: doc}});
    this.dataChange.next();
  }

  hasChanges(): boolean {
    return _state.hasChanges;
  }

  save(rawDocument: Document, publicityRestriction: Document.PublicityRestrictionsEnum): Observable<ISuccessEvent> {
    this.updateState({..._state, saving: true});
    const document = {...rawDocument};
    const isTmpId = FormService.isTmpId(document.id);
    document.publicityRestrictions = publicityRestriction;
    delete document._hasChanges;
    delete document._isTemplate;
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
    if (this.tmpDocId >= (Number.MAX_SAFE_INTEGER - 1003) ) {
      this.tmpDocId = 0;
    }
    this.tmpDocId = this.tmpDocId + 1;
    return FormService.tmpNs + ':' +  this.tmpDocId;
  }

  private fetchExistingDocument(form: Form.SchemaForm, documentID: string): Observable<Document> {
    if (FormService.isTmpId(documentID)) {
      this.updateState({..._state, hasChanges: true});
      return this.userService.user$.pipe(
        take(1),
        mergeMap(p => this.documentStorage.getItem(documentID, p))
      );
    }
    return this.userService.user$.pipe(
      take(1),
      mergeMap(person => this.documentStorage.getItem(documentID, person).pipe(
        mergeMap(local => this.documentApi.findById(documentID, this.userService.getToken()).pipe(
          map((document: Document) => {
            if (document.isTemplate) {
              if (form.prepopulatedDocument) {
                return merge(
                  form.prepopulatedDocument,
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
            this.updateState({..._state, error: err.status === 404 ? FormError.notFoundDocument : FormError.loadFailed});
            return of(null);
          })
        ))
      ))
    );
  }

  private fetchEmptyData(form: Form.SchemaForm, person: Person): Observable<Document> {
    return of({id: this.getNewTmpId(), formID: form.id, creator: person.id, gatheringEvent: { leg: [person.id] }}).pipe(
      map(base => form.prepopulatedDocument ? merge(form.prepopulatedDocument, base, { arrayMerge: Util.arrayCombineMerge }) : base),
      map(data => this.addNamedPlaceData(form, data))
    );
  }

  private fetchUiSchemaContext(form: FormWithData, documentID?: string): Observable<Form.IUISchemaContext> {

    return of({
      ...form.uiSchemaContext,
      annotations: form.annotations,
      formID: form.id,
      creator: form.formData && form.formData.creator || undefined,
      isAdmin: form.rights && form.rights.admin,
      isEdit: !FormService.isTmpId(documentID),
      placeholderGeometry: _state.namedPlace && _state.namedPlace.geometry || undefined
    });
  }

  private getAnnotations(documentID: string, page = 1, results = []): Observable<Annotation[]> {
    return FormService.isTmpId(documentID) ?
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
    if (!FormService.hasFeature(form, Form.Feature.NamedPlace)) {
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

    let removeList = form.excludeFromCopy || DocumentService.removableGathering;
    if (form.namedPlaceOptions && form.namedPlaceOptions.includeUnits) {
      removeList = removeList.filter(item => item !== 'units');
    }
    this.updateState({..._state, namedPlaceForFormID: ''});

    return merge(this.documentService.removeMeta(populate, removeList), data, { arrayMerge: Util.arrayCombineMerge });
  }

  private getReadOnly(data: Document, rights: Rights, person?: Person): Readonly {
    if (rights.admin) {
      return Readonly.false;
    }
    if (person && person.id && data && data.id && data.creator !== person.id && (!data.editors || data.editors.indexOf(person.id) === -1)) {
      return Readonly.noEdit;
    }
    return data && typeof data.locked !== 'undefined' ? (data.locked ? Readonly.true : Readonly.false) : Readonly.false;
  }

  private currentDateTime() {
    return moment().format();
  }

  private updateState(state: ILajiFormState) {
    this.store.next(_state = state);
  }
}
