import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { TransferState } from '@angular/platform-browser';
import { Store } from '../store/store';
import { Information } from '../shared/model/Information';

export class InformationState {
  info: Information;
}

@Injectable()
export class InformationStore extends Store<InformationState> {
  constructor (transferState: TransferState, @Inject(PLATFORM_ID) platformId: Object) {
    super('information', new InformationState(), transferState, platformId);
  }

  setInformation(information: Information) {
    this.setState({
      ...this.state,
      info: information
    });
  }

}
