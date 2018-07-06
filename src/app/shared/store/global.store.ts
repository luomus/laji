import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { TransferState } from '@angular/platform-browser';
import { Information } from '../model/Information';
import { Store } from '../../store/store';

export class GlobalState {
  currentLang: string;
  informationIndex: Information[];
}

@Injectable({providedIn: 'root'})
export class GlobalStore extends Store<GlobalState> {
  constructor (transferState: TransferState, @Inject(PLATFORM_ID) platformId: Object) {
    super('global', new GlobalState(), transferState, platformId);
  }

  setCurrentLang(lang: string) {
    this.setState({
      ...this.state,
      currentLang: lang
    })
  }

  setInformationIndex(index: Information[]) {
    this.setState({
      ...this.state,
      informationIndex: index
    });
  }
}
