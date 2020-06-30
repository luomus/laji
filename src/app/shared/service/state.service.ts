import { Injectable } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';
import { PlatformService } from './platform.service';

const LAJI_STATE_KEY = makeStateKey('l');

@Injectable({
  providedIn: 'root'
})
export class StateService {

  private state = {};

  constructor(
    private platformService: PlatformService,
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
    if (this.platformService.isServer) {
      this.transferState.set(LAJI_STATE_KEY, this.state);
    }
  }

  private initState() {
    this.state = this.transferState.get(LAJI_STATE_KEY, {});
  }
}
