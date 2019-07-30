import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, of as ObservableOf, ReplaySubject, Subscription } from 'rxjs';
import {
  auditTime,
  catchError, delay,
  distinctUntilChanged,
  map,
  mergeMap,
  share,
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
import { AreaService } from '../../shared/service/area.service';
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
  formData?: Document;
  annotations?: Annotation[];
  rights?: Rights;
  uiSchemaContext?: IUISchemaContext;
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

const _state: ILajiFormState = {
  hasChanges: false,
  saving: false,
  loading: false,
  error: FormError.ok,
};

@Injectable()
export class LajiFormDocumentFacade {

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

  constructor(
    private translateService: TranslateService,
    private formService: FormService,
  ) {}

  loadForm(formID: string, documentID?: string): void {
    this.formService.getForm(formID, this.translateService.currentLang).subscribe();
  }

  useNamedPlace(namedPlace: NamedPlace, namedPlaceForFormID: string) {
  }

  lock(lock: boolean) {
  }

  dataUpdate(doc: Document) {
  }

  hasChanges(): boolean {
    return false;
  }

  save(rawDocument: Document, publicityRestriction: Document.PublicityRestrictionsEnum): Observable<ISuccessEvent> {
    return null;
  }

  discardChanges() {
  }
}
