import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, from, Observable, of, Subscription, zip } from 'rxjs';
import { catchError, distinctUntilChanged, map, mergeMap, take, tap, toArray } from 'rxjs/operators';
import { Document } from '../../shared/model/Document';
import { hotObjectObserver } from '../../shared/observable/hot-object-observer';
import { UserService } from '../../shared/service/user.service';
import { LajiApiService } from '../../shared/service/laji-api.service';
import { DocumentStorage } from '../../storage/document.storage';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { Form } from '../../shared/model/Form';
import { FormService } from '../../shared/service/form.service';
import { TranslateService } from '@ngx-translate/core';
import { Util } from '../../shared/service/util.service';

export interface ILatestDocument {
  document: Document;
  form: Form.List;
}

interface ILatestDocumentsState {
  latest: ILatestDocument[];
  tmpDocuments: ILatestDocument[];
  loading: boolean;
}

let _state: ILatestDocumentsState = {
  latest: [],
  tmpDocuments: [],
  loading: false
};

@Injectable({providedIn: 'root'})
export class LatestDocumentsFacade implements OnDestroy {

  private store  = new BehaviorSubject<ILatestDocumentsState>(_state);
  state$ = this.store.asObservable();

  loading$      = this.state$.pipe(map((state) => state.loading), distinctUntilChanged());
  latest$       = this.state$.pipe(map((state) => state.latest), distinctUntilChanged());
  tmpDocuments$ = this.state$.pipe(map((state) => state.tmpDocuments), distinctUntilChanged());

  vm$: Observable<ILatestDocumentsState> = hotObjectObserver<ILatestDocumentsState>({
    latest: this.latest$,
    tmpDocuments: this.tmpDocuments$,
    loading: this.loading$
  });

  private readonly localUpdateSub: Subscription;
  private updateSub: Subscription;
  private updateSubKey: string | undefined;
  private remoteRefresh;

  private formID: string[] | undefined;

  constructor(
    private documentApi: DocumentApi,
    private lajiApi: LajiApiService,
    private userService: UserService,
    private documentStorage: DocumentStorage,
    private formService: FormService,
    private translateService: TranslateService,
    private ngZone: NgZone
  ) {
    this.localUpdateSub = this.documentStorage.deletes$.subscribe(() => {
      this.updateLocal();
    });
  }

  ngOnDestroy(): void {
    if (this.localUpdateSub) {
      this.localUpdateSub.unsubscribe();
    }
  }

  setFormID(formID?: string | string[]): void {
    this.formID = Array.isArray(formID) ? formID : [formID];
    this.update();
  }

  update(): void {
    this.updateLocal();
    this.updateRemote();
    if (this.remoteRefresh) {
      clearTimeout(this.remoteRefresh);
      delete this.remoteRefresh;
    }
    // ES is not reflecting deletes immediately so we'll make another remote update after 10sec.
    this.ngZone.runOutsideAngular(() => {
      this.remoteRefresh = setTimeout(() => this.ngZone.run(() => this.updateRemote()), 10000);
    });
  }

  discardTmpData(id: string): void {
    this.userService.user$.pipe(
      take(1),
      mergeMap(person => this.documentStorage.removeItem(id, person)),
      tap(() => this.update())
    ).subscribe();
  }

  private updateLocal() {
    this.userService.user$.pipe(
      take(1),
      mergeMap(p => this.documentStorage.getAll(p, 'onlyTmp').pipe(
        map(tmps => this.formID ? tmps.filter(tmp => this.formID.includes[tmp.formID]) : tmps),
        mergeMap(tmps => this.getAllForms().pipe(
          map(forms => tmps.map(tmp => ({
            document: tmp,
            form: forms[tmp.formID]
          })))
        ))
      )),
      catchError(() => of([]))
    ).subscribe(tmpDocuments => this.updateState({..._state, tmpDocuments}));
  }

  private updateRemote() {
    if (this.updateSub && this.updateSubKey === this.getSubKey()) {
      return;
    }
    this.updateSubKey = this.getSubKey();
    this.updateState({..._state, loading: true});
    this.updateSub = (!this.formID ? this.documentApi.findAll(this.userService.getToken(), '1', '10') : zip(...this.formID.map(formID =>
      this.documentApi.findAll(this.userService.getToken(), '1', '10', { formID })
    )).pipe(
        map(docRes => {
          const mergedDocks = [];
          docRes.forEach(docs => mergedDocks.push(...docs.results));
          mergedDocks.sort(doc => doc.id);
          return mergedDocks.slice(0, 10);
        }),
        map(docRes => ({results: docRes}))
    )
    ).pipe(
      map(docRes => docRes.results),
      mergeMap(documents => this.checkForLocalData(documents)),
      catchError((e) => {
        console.log(e);
        return of([] as ILatestDocument[]);
      }),
    ).subscribe((latest) => {
      this.updateState({..._state, latest, loading: false});
      delete this.updateSub;
    });
  }

  getSubKey() {
    return this.formID?.[0];
  }

  private getAllForms(): Observable<{[id: string]: Form.List}> {
    return this.formService.getAllForms(this.translateService.currentLang).pipe(
      take(1),
      map(forms => forms.reduce((cumulative, form) => {
        cumulative[form.id] = form;
        return cumulative;
      }, {}))
    );
  }

  private checkForLocalData(documents: Document[]): Observable<ILatestDocument[]> {
    return this.getAllForms().pipe(
      mergeMap((forms) => from(documents).pipe(
        mergeMap(document => this.userService.user$.pipe(
          take(1),
          mergeMap(person => this.documentStorage.getItem(document.id, person).pipe(
            map(local => {
              if (Util.isLocalNewestDocument(local, document)) {
                return {document: local, form: forms[document.formID]};
              }
              if (local) {
                this.documentStorage.removeItem(local.id, person);
              }
              return {document, form: forms[document.formID]};
            })
          ))
        )),
        toArray()
      ))
    );
  }

  private updateState(state: ILatestDocumentsState) {
    this.store.next(_state = state);
  }
}
