import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, mergeMap, take, throttleTime } from 'rxjs/operators';
import { hotObjectObserver } from '../../shared/observable/hot-object-observer';
import { Form } from '../../shared/model/Form';
import { LocalStorage } from 'ngx-webstorage';
import { BrowserService } from '../../shared/service/browser.service';
import { LajiApiService } from '../../shared/service/laji-api.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../shared/service/user.service';
import { NamedPlace } from '../../shared/model/NamedPlace';
import { Util } from '../../shared/service/util.service';
import { DocumentService } from '../own-submissions/service/document.service';
import { FormService } from '../../shared/service/form.service';
import { Document } from '../../shared/model/Document';

interface FormWithData extends Form.SchemaForm {
  formData: Document;
}

interface IPersistentState {
  tmpIdSeq: number;
}

interface IFormState extends IPersistentState {
  documentID?: string;
  form?: FormWithData;
  hasChanges: boolean;
  namedPlace?: NamedPlace;
  namedPlaceForFormID?: string;
}

const _persistentState: IPersistentState = {
  tmpIdSeq: 0
};

let _state: IFormState = {
  ..._persistentState,
  hasChanges: false
};

@Injectable()
export class LajiFormFacade implements OnDestroy {

  @LocalStorage('formState', _persistentState)
  private persistentState: IPersistentState;

  private formData = new ReplaySubject<Document>(1);
  private store  = new BehaviorSubject<IFormState>(_state);
  formData$ = this.store.asObservable();
  state$ = this.store.asObservable();

  form$          = this.state$.pipe(map((state) => state.form), distinctUntilChanged());
  tmpIdSeq       = this.state$.pipe(map((state) => state.tmpIdSeq), distinctUntilChanged());
  hasChanges     = this.state$.pipe(map((state) => state.hasChanges), distinctUntilChanged());

  vm$: Observable<IFormState> = hotObjectObserver<IFormState>({
    form: this.form$,
    tmpIdSeq: this.tmpIdSeq,
    hasChanges: this.hasChanges
  });

  private readonly dataSub: Subscription;
  private formSub: Subscription;

  constructor(
    private browserService: BrowserService,
    private lajiApi: LajiApiService,
    private translateService: TranslateService,
    private userService: UserService,
    private documentService: DocumentService,
    private formService: FormService,
  ) {
    this.updateState({..._state, ...this.persistentState});
    this.dataSub = this.formData$.pipe(
      throttleTime(3000),
      debounceTime(3000)
    ).subscribe(() => {
      console.log('FORM DATA UPDATE');
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
    this.updateState({..._state, form: undefined, hasChanges: false});
    this.formSub = this.formService.getForm(formID, this.translateService.currentLang).pipe(
      mergeMap((form) => this.userService.user$.pipe(
        take(1),
        map((person) => ({'creator': person.id, 'gatheringEvent': { 'leg': [person.id] }})),
        map(data => this.addNamedPlaceData(form, data, documentID)),
        map(data => ({...form, formData: data}))
      ))
    ).subscribe((form: FormWithData) => {
      this.updateState({..._state, form});
    });
  }

  useNamedPlace(namedPlace: NamedPlace, namedPlaceForFormID: string) {
    this.updateState({..._state, namedPlace, namedPlaceForFormID});
  }

  private addNamedPlaceData(form: Form.SchemaForm, data: Document, documentID?: string) {
    if (!FormService.hasFeature(form, Form.Feature.NamedPlace) || !!documentID) {
      return data;
    }
    if (_state.namedPlaceForFormID !== form.id) {
      // TODO redirect to namedplace select
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
    return this.documentService.removeMeta(populate, removeList);
  }

  private updateState(state: IFormState) {
    this.store.next(_state = state);
  }

  private updatePersistentState(state: IPersistentState) {
    this.persistentState = state;
    this.updateState({..._state, ...state});
  }
}
