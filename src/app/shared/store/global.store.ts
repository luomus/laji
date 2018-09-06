import { Injectable } from '@angular/core';
import { Information } from '../model/Information';
import { Store } from '../../store/store';

export class GlobalState {
  currentLang: string;
  informationIndex: Information[];
}

@Injectable({providedIn: 'root'})
export class GlobalStore extends Store<GlobalState> {
  constructor () {
    super('global', new GlobalState());
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
