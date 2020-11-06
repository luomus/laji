import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { hotObjectObserver } from '../shared/observable/hot-object-observer';
import { LocalStorage } from 'ngx-webstorage';
import { BrowserService } from '../shared/service/browser.service';
import { LajiApiService } from '../shared/service/laji-api.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../shared/service/user.service';
import { FooterService } from '../shared/service/footer.service';
import { Form } from '../shared/model/Form';
import { Document } from '../shared/model/Document';

interface IPersistentState {
  activeYear: string;
  showIntro: boolean;
}

interface IVihkoState extends IPersistentState {
  forms: Form.List[];
  latestDocs: Document[];
}

interface IVihkoViewModel extends IVihkoState {
  lgScreen: boolean;
}

const _persistentState: IPersistentState = {
  activeYear: '',
  showIntro: true
};

let _state: IVihkoState = {
  ..._persistentState,
  forms: [],
  latestDocs: []
};

@Injectable()
export class HasekaFacade implements OnDestroy {

  @LocalStorage('vihkoState', _persistentState)
  private persistentState: IPersistentState;

  private store  = new BehaviorSubject<IVihkoState>(_state);
  state$ = this.store.asObservable();

  lgScreen$      = this.browserService.lgScreen$;
  activeYear$    = this.state$.pipe(map((state) => state.activeYear), distinctUntilChanged());
  showIntro$     = this.state$.pipe(map((state) => state.showIntro));
  forms$         = this.state$.pipe(map((state) => state.forms), distinctUntilChanged());
  latestDocs$    = this.state$.pipe(map((state) => state.latestDocs), distinctUntilChanged());

  vm$: Observable<IVihkoViewModel> = hotObjectObserver<IVihkoViewModel>({
    forms: this.forms$,
    lgScreen: this.lgScreen$,
    showIntro: this.showIntro$,
    activeYear: this.activeYear$,
    latestDocs: this.latestDocs$
  });

  private userSub: Subscription;

  constructor(
    private browserService: BrowserService,
    private lajiApi: LajiApiService,
    private translateService: TranslateService,
    private userService: UserService,
    private footerService: FooterService
  ) {
    this.updateState({..._state, ...this.persistentState});
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  updateLatestDocuments(): void {
    const token = this.userService.getToken();
    if (!token) {
      this.updateState({..._state, latestDocs: []});
    }

  }

  activeYear(year: string) {
    this.updatePersistentState({...this.persistentState, activeYear: year});
  }

  showFooter() {
    this.footerService.footerVisible = true;
  }

  hideFooter() {
    this.footerService.footerVisible = false;
  }

  private updateState(state: IVihkoState) {
    this.store.next(_state = state);
  }

  private updatePersistentState(state: IPersistentState) {
    this.persistentState = state;
    this.updateState({..._state, ...state});
  }
}
