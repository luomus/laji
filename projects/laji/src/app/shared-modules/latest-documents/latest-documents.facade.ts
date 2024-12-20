import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, from, Observable, of, Subscription } from 'rxjs';
import { catchError, distinctUntilChanged, map, mergeMap, take, tap, toArray } from 'rxjs/operators';
import { Document } from '../../shared/model/Document';
import { hotObjectObserver } from '../../shared/observable/hot-object-observer';
import { UserService } from '../../shared/service/user.service';
import { DocumentStorage } from '../../storage/document.storage';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { Form } from '../../shared/model/Form';
import { FormService } from '../../shared/service/form.service';
import { Util } from '../../shared/service/util.service';

export interface ILatestDocument {
  document: Document & { id: string };
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
  private updateSub?: Subscription;
  private updateSubKey: string | undefined;
  private remoteRefresh?: NodeJS.Timer;

  private collectionID: string | undefined;

  constructor(
    private documentApi: DocumentApi,
    private userService: UserService,
    private documentStorage: DocumentStorage,
    private formService: FormService,
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

  setCollectionID(collectionID?: string): void {
    this.collectionID = collectionID;
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mergeMap(p => this.documentStorage.getAll(p!, 'onlyTmp').pipe(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        map(tmps => this.collectionID ? tmps.filter(tmp => this.collectionID === tmp!.collectionID) : tmps),
        mergeMap(tmps => this.getAllForms().pipe(
          map(forms => tmps.map(tmp => ({
            document: tmp,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            form: forms[tmp!.formID]
          })))
        ))
      )),
      catchError(() => of([]))
    ).subscribe(tmpDocuments => this.updateState({..._state, tmpDocuments: tmpDocuments as ILatestDocument[]}));
  }

  private updateRemote() {
    if (this.updateSub && this.updateSubKey === this.getSubKey()) {
      return;
    } else if (this.updateSub) {
      this.updateSub.unsubscribe();
    }

    this.updateSubKey = this.getSubKey();
    this.updateState({..._state, loading: true});
    this.updateSub = this.documentApi.findAll(this.userService.getToken(), '1', '10', { collectionID: this.collectionID }).pipe(
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
    return this.collectionID;
  }

  private getAllForms(): Observable<{[id: string]: Form.List}> {
    return this.formService.getAllForms().pipe(
      take(1),
      map(forms => forms.reduce((cumulative, form) => {
        cumulative[form.id] = form;
        return cumulative;
      }, {} as {[id: string]: Form.List}))
    );
  }

  private checkForLocalData(documents: (Document & { id: string })[]): Observable<ILatestDocument[]> {
    return this.getAllForms().pipe(
      mergeMap((forms) => from(documents).pipe(
        mergeMap(document => this.userService.user$.pipe(
          take(1),
          mergeMap(person => this.documentStorage.getItem(document.id, person).pipe(
            map(local => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              if (Util.isLocalNewestDocument(local!, document)) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return {document: local!, form: forms[document.formID]};
              }
              if (local) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.documentStorage.removeItem(local!.id, person);
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
