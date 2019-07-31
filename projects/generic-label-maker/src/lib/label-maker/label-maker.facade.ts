import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';


interface IState {
  hasChanges: boolean;
}

let _state: IState = {
  hasChanges: false
};

export class LabelMakerFacade {

  private store  = new BehaviorSubject<IState>(_state);
  state$ = this.store.asObservable();

  hasChanges$ = this.state$.pipe(map((state) => state.hasChanges), distinctUntilChanged());

  hasChanges(changes: boolean) {
    this.updateState({..._state, hasChanges: changes});
  }

  private updateState(state: IState) {
    this.store.next(_state = state);
  }
}
