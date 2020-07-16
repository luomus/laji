import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  private _canUseWebWorkerLogin = true;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  get isServer(): boolean {
    return !isPlatformBrowser(this.platformId);
  }

  get canUseWebWorker(): boolean {
    return typeof window !== 'undefined' && 'Worker' in window;
  }

  get canUseWebWorkerLogin(): boolean {
    return false;
    // return this._canUseWebWorkerLogin && this.canUseWebWorker && this.isBrowser;
  }

  set canUseWebWorkerLogin(canUse: boolean) {
    this._canUseWebWorkerLogin = canUse;
  }
}
