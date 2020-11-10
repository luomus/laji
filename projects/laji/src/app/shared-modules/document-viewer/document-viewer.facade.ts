import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { hotObjectObserver } from '../../shared/observable/hot-object-observer';
import { Document } from '../../shared/model/Document';
import { IdService } from '../../shared/service/id.service';
import { DocumentApi } from '../../shared/api/DocumentApi';
import { UserService } from '../../shared/service/user.service';

interface IParametersBase {
  highlight?: string;
  own?: boolean;
  result?: Array<any>;
  openAnnotation?: boolean;
  useWorldMap?: boolean;
  identifying?: boolean;
  forceLocal?: boolean;
}

export interface IDocumentIdParameters extends IParametersBase {
  document: string;
}

export interface IDocumentParameters extends IParametersBase {
  document: Document;
}

export interface IViewerState {
  document?: Document;
  highlight?: string;
  result?: Array<any>;
  own: boolean;
  openAnnotation: boolean;
  useWorldMap: boolean;
  showModal: boolean;
  identifying: boolean;
  forceLocal: boolean;
}

let _state: IViewerState = {
  own: false,
  openAnnotation: false,
  useWorldMap: true,
  showModal: false,
  identifying: false,
  forceLocal: false,
};

const defaultParams: IParametersBase = {
  highlight: '',
  openAnnotation: false,
  own: false,
  identifying: false,
  useWorldMap: true,
  forceLocal: false
};

@Injectable({providedIn: 'root'})
export class DocumentViewerFacade {

  private store  = new BehaviorSubject<IViewerState>(_state);
  state$ = this.store.asObservable();

  document$       = this.state$.pipe(map((state) => state.document), distinctUntilChanged());
  highlight$      = this.state$.pipe(map((state) => state.highlight));
  own$            = this.state$.pipe(map((state) => state.own));
  result$         = this.state$.pipe(map((state) => state.result));
  showModal$      = this.state$.pipe(map((state) => state.showModal), distinctUntilChanged());
  openAnnotation$ = this.state$.pipe(map((state) => state.openAnnotation));
  useWorldMap$    = this.state$.pipe(map((state) => state.useWorldMap));
  identifying$    = this.state$.pipe(map((state) => state.identifying));
  forceLocal$     = this.state$.pipe(map((state) => state.forceLocal));

  vm$: Observable<IViewerState> = hotObjectObserver<IViewerState>({
    showModal: this.showModal$,
    document: this.document$,
    own: this.own$,
    result: this.result$,
    highlight: this.highlight$,
    openAnnotation: this.openAnnotation$,
    useWorldMap: this.useWorldMap$,
    identifying: this.identifying$,
    forceLocal: this.forceLocal$
  });

  constructor(
    private documentApi: DocumentApi,
    private userService: UserService
  ) {}

  showRemoteDocument(param: IDocumentIdParameters): void {
    this.updateState({..._state, showModal: true});
    this.documentApi.findById(param.document, this.userService.getToken()).subscribe((document) => {
      this.showDocument({
        ...param,
        document: document
      });
    });
  }

  showDocumentID(param: IDocumentIdParameters): void {
    this.showDocument({
      ...param,
      document: {
        id: IdService.getId(param.document),
        publicityRestrictions: Document.PublicityRestrictionsEnum.publicityRestrictionsPublic} as Document
    });
  }

  showDocument(param: IDocumentParameters): void {
    if (!param.document || !param.document.id) {
      return;
    }
    this.updateState({
      ..._state,
      ...defaultParams,
      ...param,
      showModal: true
    });
  }

  close(): void {
    this.updateState({..._state, showModal: false, document: null});
  }

  private updateState(state: IViewerState) {
    this.store.next(_state = state);
  }
}
