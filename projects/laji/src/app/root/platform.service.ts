import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  private _canUseWebWorkerLogin = true;

  public window: Window;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, // eslint-disable-line @typescript-eslint/ban-types
    @Inject(DOCUMENT) public document: Document,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.window = document.defaultView!;
  }

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  get isServer(): boolean {
    return !isPlatformBrowser(this.platformId);
  }

  get canUseWebWorker(): boolean {
    return 'Worker' in this.window;
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
    const window = this.window;
    return 'AudioContext' in window || 'webkitAudioContext' in window;
  }

  get isIOS(): boolean {
    const window = this.window;
    return ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(window.navigator.platform)
      // iPad on iOS 13
      || (window.navigator.userAgent.includes('MAC') && 'ontouchend' in this.document);
  }
}
