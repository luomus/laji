import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { isPlatformServer } from '@angular/common';

const LAJI_STATE_KEY = makeStateKey('l');

@Injectable({
  providedIn: 'root'
})
export class StateService {

  private state = {};

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private transferState: TransferState
  ) {
    this.initState();
  }

  has(key: string): boolean {
    return key in this.state;
  }

  get<T>(key: string, defaultValue: T): T {
    return key in this.state ? this.state[key] : defaultValue;
  }

  set(key: string, value: any) {
    this.state[key] = value;
    if (isPlatformServer(this.platformId)) {
      this.transferState.set(LAJI_STATE_KEY, this.state);
    }
  }

  private initState() {
    this.state = this.transferState.get(LAJI_STATE_KEY, {});
  }
}
