import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, of as ObservableOf, ReplaySubject, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, mergeMap, take, tap, throttleTime } from 'rxjs/operators';
import { hotObjectObserver } from '../../shared/observable/hot-object-observer';
import { Form } from '../../shared/model/Form';
import { LocalStorage } from 'ngx-webstorage';
import { BrowserService } from '../../shared/service/browser.service';
import { LajiApi, LajiApiService } from '../../shared/service/laji-api.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../shared/service/user.service';
import { NamedPlace } from '../../shared/model/NamedPlace';
import { Util } from '../../shared/service/util.service';
import { DocumentService } from '../own-submissions/service/document.service';
import { FormService } from '../../shared/service/form.service';
import { Document } from '../../shared/model/Document';
import merge from 'deepmerge';
import { Annotation } from '../../shared/model/Annotation';
import { AreaService } from '../../shared/service/area.service';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { Logger } from '../../shared/logger';
import { NamedPlacesService } from '../named-place/named-places.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormPermissionService, Rights } from '../../+haseka/form-permission/form-permission.service';

export enum FormError {
  ok,
  notFound,
  loadFailed,
  missingNamedPlace,
  noAccess
}

interface IEnum {
  enum: string[];
  enumNames: string[];
}

interface IUISchemaContext {
  creator: string;
  municipalityEnum: IEnum[];
  biogeographicalProvinceEnum: IEnum[];
  annotations: Annotation[];
  isAdmin: boolean;
  isEdit: boolean;
  placeholderGeometry?: any;
}

interface FormWithData extends Form.SchemaForm {
  formData: Document;
  annotations: Annotation[];
  rights: Rights;
  uiSchemaContext: IUISchemaContext;
}

interface IPersistentState {
  tmpIdSeq: number;
}

export interface ILajiFormState extends IPersistentState {
  documentID?: string;
  form?: FormWithData;
  hasChanges: boolean;
  namedPlace?: NamedPlace;
  namedPlaceForFormID?: string;
  error: FormError;
  saving: boolean;
  loading: boolean;
}

const _persistentState: IPersistentState = {
  tmpIdSeq: 0
};

let _state: ILajiFormState = {
  ..._persistentState,
  hasChanges: false,
  saving: false,
  loading: false,
  error: FormError.ok
};

@Injectable()
export class LajiFormDocumentFacade implements OnDestroy {

  @LocalStorage('formState', _persistentState)
  private persistentState: IPersistentState;

  private formData = new ReplaySubject<Document>(1);
  private store  = new BehaviorSubject<ILajiFormState>(_state);
  formData$ = this.formData.asObservable();
  state$ = this.store.asObservable();

  form$          = this.state$.pipe(map((state) => state.form), distinctUntilChanged());
  tmpIdSeq$      = this.state$.pipe(map((state) => state.tmpIdSeq), distinctUntilChanged());
  hasChanges$    = this.state$.pipe(map((state) => state.hasChanges), distinctUntilChanged());
  loading$       = this.state$.pipe(map((state) => state.loading), distinctUntilChanged());
  saving$        = this.state$.pipe(map((state) => state.saving), distinctUntilChanged());
  error$         = this.state$.pipe(map((state) => state.error), distinctUntilChanged());

  vm$: Observable<ILajiFormState> = hotObjectObserver<ILajiFormState>({
    form: this.form$,
    tmpIdSeq: this.tmpIdSeq$,
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
    private areaService: AreaService,
    private namedPlacesService: NamedPlacesService,
    private formPermissionService: FormPermissionService
  ) {
    this.updateState({..._state, ...this.persistentState});
    this.dataSub = this.formData$.pipe(
      throttleTime(3000),
      debounceTime(3000)
    ).subscribe((data) => {
      console.log('FORM DATA UPDATE!!!', data);
    });
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
    if (this.formSub) {
      this.formSub.unsubscribe();
    }
    this.updateState({..._state, form: undefined, loading: true, hasChanges: false, error: FormError.ok});
    this.formSub = this.formService.getForm(formID, this.translateService.currentLang).pipe(
      mergeMap(form => this.formPermissionService.getRights(form).pipe(
        tap(rights => rights.edit === false ? this.updateState({..._state, error: FormError.noAccess}) : null),
        mergeMap(rights => rights.edit === false ?
          of(null) : ((FormService.isTmpId(documentID) ? this.fetchEmptyData(form) : this.fetchExistingDocument(documentID)).pipe(
            map(data => ({...form, formData: data, rights}))
          ))
        )
      )),
      mergeMap(form => this.getAnnotations(documentID).pipe(
        map((annotations) => ({...form, annotations}))
      )),
      mergeMap(form => this.fetchUiSchemaContext(form, documentID).pipe(
        map(uiSchemaContext => ({...form, uiSchemaContext}))
      )),
      catchError((err) => {
        console.log('Form error', err);
        this.updateState({
          ..._state,
          error: err instanceof HttpErrorResponse && err.status === 404 ? FormError.notFound :  FormError.loadFailed
        });
        return of(null);
      })
    ).subscribe((form: FormWithData) => {
      this.updateState({..._state, loading: false, form: _state.error === FormError.ok ? form : null});
    });
  }

  useNamedPlace(namedPlace: NamedPlace, namedPlaceForFormID: string) {
    this.updateState({..._state, namedPlace, namedPlaceForFormID});
  }

  lock(lock: boolean) {
    this.updateState({..._state, form: {
      ..._state.form,
        formData: {..._state.form.formData, locked: lock},
        uiSchema: {..._state.form.uiSchema, 'ui:disabled': lock}
    }});
  }

  dataUpdate(doc: Document) {
    this.updateState({..._state, hasChanges: true});
    this.formData.next(doc);
  }

  hasChanges(): boolean {
    return _state.hasChanges;
  }

  save(document: Document, publicityRestriction: Document.PublicityRestrictionsEnum): Observable<{
    success: boolean,
    form: FormWithData,
    document: Document
  }> {
    if (_state.saving) {
      return;
    }
    this.updateState({..._state, saving: true});
    document.publicityRestrictions = publicityRestriction;
    delete document._hasChanges;
    delete document._isTemplate;
    if (FormService.isTmpId(document.id)) {
      delete document.id;
    }
    return (document.id && FormService.isTmpId(document.id) ?
      this.documentApi.update(document.id, document, this.userService.getToken()) :
      this.documentApi.create(document, this.userService.getToken())).pipe(
      catchError(e => {
        try {
          this.logger.error('UNABLE TO SAVE DOCUMENT', { data: JSON.stringify(document), error: JSON.stringify(e._body)});
        } catch (e) {}
        return of(null);
      }),
      map(doc => ({success: !!doc, form: _state.form, document: doc})),
      tap((res) => this.updateState({
        ..._state,
        saving: false,
        hasChanges: res.success ? false : _state.hasChanges
      })),
      tap((res) => res.success ? this.namedPlacesService.invalidateCache() : null)
    );
  }

  private fetchExistingDocument(documentID: string): Observable<Document> {
    return this.documentApi.findById(documentID, this.userService.getToken()).pipe(
      map((document: Document) => document.isTemplate ?
          this.documentService.removeMeta(document, ['isTemplate', 'templateName', 'templateDescription']) :
          document));
  }

  private fetchEmptyData(form: Form.SchemaForm): Observable<Document> {
    return this.userService.user$.pipe(
      take(1),
      map(person => ({formID: form.id, creator: person.id, gatheringEvent: { leg: [person.id] }})),
      map(base => form.prepopulatedDocument ? merge(form.prepopulatedDocument, base, { arrayMerge: Util.arrayCombineMerge }) : base),
      map(base => form.prepopulatedDocument ? merge(form.prepopulatedDocument, base, { arrayMerge: Util.arrayCombineMerge }) : base),
      map(data => this.addNamedPlaceData(form, data)));
  }

  private fetchUiSchemaContext(form: FormWithData, documentID?: string): Observable<IUISchemaContext> {
    const lang = this.translateService.currentLang;
    const resultToEnum = (values: any[]) => {
      return values.reduce((enums, current) => {
        enums.enum.push(current.id);
        enums.enumNames.push(current.value);
        return enums;
      }, {
        enum: [],
        enumNames: []
      });
    };

    return this.areaService.getMunicipalities(lang).pipe(
      map(municipalities => ({municipalityEnum: resultToEnum(municipalities)})),
      mergeMap((result) => this.areaService.getBiogeographicalProvinces(lang).pipe(
        map(biogeographicalProvinces => ({
          ...result,
          biogeographicalProvinceEnum: resultToEnum(biogeographicalProvinces),
          annotations: form.annotations,
          formID: form.id,
          creator: form.formData.creator,
          isAdmin: form.rights.edit,
          isEdit: FormService.isTmpId(documentID),
          placeholderGeometry: _state.namedPlace && _state.namedPlace.geometry || undefined
        }))
      ))
    );
  }

  private getAnnotations(documentID: string, page = 1, results = []): Observable<Annotation[]> {
    return !documentID || FormService.isTmpId(documentID) ?
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
      if (_state.error === FormError.ok) {
        this.updateState({..._state, error: FormError.missingNamedPlace});
      }
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

    return merge(this.documentService.removeMeta(populate, removeList), data, { arrayMerge: Util.arrayCombineMerge });
  }

  private updateState(state: ILajiFormState) {
    this.store.next(_state = state);
  }

  private updatePersistentState(state: IPersistentState) {
    this.persistentState = state;
    this.updateState({..._state, ...state});
  }
}
