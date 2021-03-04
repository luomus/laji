import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import { environment } from '../../../environments/environment';
import {WINDOW} from '@ng-toolkit/universal';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  private _canUseWebWorkerLogin = true;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(WINDOW) private window: Window,
    @Inject(DOCUMENT) private document: Document,
  ) { }

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  get isServer(): boolean {
    return !isPlatformBrowser(this.platformId);
  }

  get canUseWebWorker(): boolean {
    return typeof this.window !== 'undefined' && 'Worker' in this.window;
  }

  get canUseWebWorkerLogin(): boolean {
    // If you need to disable web-worker login uncomment the following line
    // return false;
    return (environment as any).loginCheck && this._canUseWebWorkerLogin && this.canUseWebWorker && this.isBrowser;
  }

  set canUseWebWorkerLogin(canUse: boolean) {
    this._canUseWebWorkerLogin = canUse;
  }

  get webAudioApiIsSupported(): boolean {
    return typeof this.window !== 'undefined' && ('AudioContext' in this.window || 'webkitAudioContext' in this.window);
  }

  get isIOS(): boolean {
    return ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(this.window.navigator.platform)
      // iPad on iOS 13
      || (this.window.navigator.userAgent.includes('MAC') && 'ontouchend' in this.document);
  }
}
