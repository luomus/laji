import { Inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';
import { PlatformService } from './platform.service';
import { DOCUMENT, Location } from '@angular/common';
import { WINDOW } from '@ng-toolkit/universal';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { HistoryService } from './history.service';

export interface IBrowserState {
  visibility: boolean;
  lgScreen: boolean;
}

let _state: IBrowserState = {
  visibility: true,
  lgScreen: true
};

const lgScreenSize = 767;

@Injectable({
  providedIn: 'root'
})
export class BrowserService implements OnDestroy {

  private store  = new BehaviorSubject<IBrowserState>(_state);
  private state$ = this.store.asObservable();

  lgScreen$ = this.state$.pipe(map((state) => state.lgScreen), distinctUntilChanged());
  visibility$ = this.state$.pipe(map((state) => state.visibility), distinctUntilChanged());

  private resizeSub: Subscription;
  private visibilityChangeEvent: string;
  private handlerForVisibilityChange: Function;

  constructor(
    @Inject(DOCUMENT) private document: any,
    @Inject(WINDOW) private window: Window,
    private zone: NgZone,
    private platformService: PlatformService,
    private historyService: HistoryService,
    private location: Location
  ) {
    if (!platformService.isBrowser) {
      return;
    }
    this.initVisibilityListener();
    this.initScreenSizeListener();
  }

  ngOnDestroy(): void {
    if (!this.platformService.isBrowser) {
      return;
    }
    if (this.resizeSub) {
      this.resizeSub.unsubscribe();
    }
    if (this.handlerForVisibilityChange) {
      this.document.removeEventListener(this.handlerForVisibilityChange);
    }
  }

  triggerResizeEvent(): void {
    if (!this.platformService.isBrowser) {
      return;
    }
    setTimeout(() => {
      try {
        this.window.dispatchEvent(new Event('resize'));
      } catch (e) {
        try {
          const evt: any = this.window.document.createEvent('UIEvents');
          evt.initUIEvent('resize', true, false, this.window, 0);
          this.window.dispatchEvent(evt);
        } catch (e) {}
      }
    }, 100);
  }

  goBack(onNoHistory?: () => void): void {
    if (!this.platformService.isBrowser) {
      return;
    }
    if (this.historyService.hasPrevious()) {
      this.location.back();
    } else if (onNoHistory) {
      onNoHistory();
    }
  }

  public getPathAndQueryFromUrl(uri: string): [string, {[param: string]: string}] {
    const [path, query = ''] = uri.split('?');
    const queryObject = query.split('&').filter(s => s).reduce((q, param) => {
      const [name, value] = param.split('=');
      q[name]  = value;
      return q;
    }, {});
    return [path, queryObject];
  }

  private initVisibilityListener() {
    let hidden, visibilityChange;
    if (typeof this.document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
      hidden = 'hidden';
      visibilityChange = 'visibilitychange';
    } else if (typeof this.document.msHidden !== 'undefined') {
      hidden = 'msHidden';
      visibilityChange = 'msvisibilitychange';
    } else if (typeof this.document.webkitHidden !== 'undefined') {
      hidden = 'webkitHidden';
      visibilityChange = 'webkitvisibilitychange';
    }

    this.handlerForVisibilityChange = () => {
      this.updateState({..._state, visibility: !this.document[hidden]});
    };
    try {
      this.visibilityChangeEvent = visibilityChange;
      this.document.addEventListener(visibilityChange, this.handlerForVisibilityChange, false);
    } catch (e) {}
  }

  private initScreenSizeListener() {
    this.updateScreenSize();
    this.zone.runOutsideAngular(() => {
      this.resizeSub = fromEvent(window, 'resize').pipe(
        debounceTime(1000),
        distinctUntilChanged()
      ).subscribe(() => {
        this.zone.run(() => this.updateScreenSize());
      });
    });
  }

  private updateScreenSize() {
    this.updateState({..._state, lgScreen: this.window.innerWidth > lgScreenSize});
  }

  private updateState(state: IBrowserState) {
    this.store.next(_state = state);
  }
}
