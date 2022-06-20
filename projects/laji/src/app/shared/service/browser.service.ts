import { Inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import { BehaviorSubject, fromEvent, Subject, Subscription } from 'rxjs';
import { PlatformService } from '../../root/platform.service';
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

  private resizingSub?: Subscription;
  private resizeSub?: Subscription;
  private visibilityChangeEvent?: string;
  private handlerForVisibilityChange?: EventListener;
  private resize = new Subject();

  constructor(
    @Inject(DOCUMENT) public readonly document: Document,
    @Inject(WINDOW) public readonly window: Window,
    private zone: NgZone,
    private platformService: PlatformService,
    private historyService: HistoryService,
    private location: Location
  ) {
    if (!platformService.isBrowser) {
      return;
    }
    this.initResizeListener();
    this.initVisibilityListener();
    this.initScreenSizeListener();
  }

  ngOnDestroy(): void {
    if (!this.platformService.isBrowser) {
      return;
    }
    if (this.resizingSub) {
      this.resizingSub.unsubscribe();
    }
    if (this.resizeSub) {
      this.resizeSub.unsubscribe();
    }
    if (this.handlerForVisibilityChange) {
      this.document.removeEventListener(this.visibilityChangeEvent as any, this.handlerForVisibilityChange);
    }
  }

  triggerResizeEvent(): void {
    if (!this.platformService.isBrowser) {
      return;
    }
    this.resize.next();
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
    }, {} as Record<string, string>);
    return [path, queryObject];
  }

  private initVisibilityListener() {
    let hidden: keyof Document | undefined, visibilityChange: keyof DocumentEventMap | undefined;
    if (typeof this.document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
      hidden = 'hidden';
      visibilityChange = 'visibilitychange';
    } else if (typeof (this.document as any).msHidden !== 'undefined') {
      hidden = 'msHidden' as keyof Document;
      visibilityChange = 'msvisibilitychange' as keyof DocumentEventMap;
    } else if (typeof (this.document as any).webkitHidden !== 'undefined') {
      hidden = 'webkitHidden' as keyof Document;
      visibilityChange = 'webkitvisibilitychange' as keyof DocumentEventMap;
    }

    if (!visibilityChange || !hidden) {
      return;
    }

    this.handlerForVisibilityChange = () => {
      if (!hidden) {
        return;
      }
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
      this.resizingSub = fromEvent(window, 'resize').pipe(
        debounceTime(1000),
        distinctUntilChanged()
      ).subscribe(() => {
        this.zone.run(() => this.updateScreenSize());
      });
    });
  }

  private initResizeListener() {
    this.resizeSub = this.resize.pipe(
      debounceTime(100)
    ).subscribe(() => {
      try {
        this.window.dispatchEvent(new Event('resize'));
      } catch (e) {
        const evt: any = this.window.document.createEvent('UIEvents');
        evt.initUIEvent('resize', true, false, this.window, 0);
        this.window.dispatchEvent(evt);
      }
    });
  }

  private updateScreenSize() {
    this.updateState({..._state, lgScreen: this.window.innerWidth > lgScreenSize});
  }

  private updateState(state: IBrowserState) {
    this.store.next(_state = state);
  }
}
