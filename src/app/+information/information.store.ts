/* tslint:disable:max-classes-per-file */
import { Injectable } from '@angular/core';
import { Store } from '../store/store';
import { Information } from '../shared/model/Information';

export class InformationState {
  info: Information;
}

@Injectable()
export class InformationStore extends Store<InformationState> {
  constructor () {
    super('information', new InformationState());
  }

  setInformation(information: Information) {
    this.setState({
      ...this.state,
      info: information
    });
  }

}
